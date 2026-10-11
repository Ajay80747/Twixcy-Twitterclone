package com.twixcy.tweetservice.exception;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private ResponseEntity<Map<String, Object>> build(HttpStatus status, String message, HttpServletRequest req) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status.value());
        body.put("message", message);
        body.put("path", req.getRequestURI());
        return ResponseEntity.status(status).body(body);
    }

    @ExceptionHandler({ResourceNotFoundException.class, NoResourceFoundException.class})
    public ResponseEntity<Map<String, Object>> notFound(Exception e, HttpServletRequest r) { return build(HttpStatus.NOT_FOUND, e.getMessage(), r); }

    @ExceptionHandler({UnauthorizedException.class, MissingRequestHeaderException.class})
    public ResponseEntity<Map<String, Object>> unauthorized(Exception e, HttpServletRequest r) {
        return build(HttpStatus.UNAUTHORIZED, e instanceof UnauthorizedException ? e.getMessage() : "Authentication required", r);
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<Map<String, Object>> forbidden(ForbiddenException e, HttpServletRequest r) { return build(HttpStatus.FORBIDDEN, e.getMessage(), r); }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<Map<String, Object>> duplicate(DuplicateResourceException e, HttpServletRequest r) { return build(HttpStatus.CONFLICT, e.getMessage(), r); }

    @ExceptionHandler({InvalidRequestException.class, ValidationException.class})
    public ResponseEntity<Map<String, Object>> invalid(RuntimeException e, HttpServletRequest r) { return build(HttpStatus.BAD_REQUEST, e.getMessage(), r); }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> validation(MethodArgumentNotValidException e, HttpServletRequest r) {
        String msg = e.getBindingResult().getFieldErrors().stream()
                .map(f -> f.getField() + ": " + f.getDefaultMessage()).collect(Collectors.joining("; "));
        return build(HttpStatus.BAD_REQUEST, msg, r);
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<Map<String, Object>> malformed(Exception e, HttpServletRequest r) { return build(HttpStatus.BAD_REQUEST, "Malformed request", r); }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> method(HttpRequestMethodNotSupportedException e, HttpServletRequest r) { return build(HttpStatus.METHOD_NOT_ALLOWED, e.getMessage(), r); }

    @ExceptionHandler(RestClientException.class)
    public ResponseEntity<Map<String, Object>> downstream(RestClientException e, HttpServletRequest r) {
        log.error("Downstream call failed", e);
        return build(HttpStatus.SERVICE_UNAVAILABLE, "A dependent service is unavailable", r);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> generic(Exception e, HttpServletRequest r) {
        log.error("Unhandled error", e);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected server error", r);
    }
}

package com.roadguardian.backend.exception;

import com.roadguardian.backend.exception.dto.ErrorResponseBody;
import com.roadguardian.backend.exception.dto.ValidationErrorResponseBody;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<ErrorResponseBody> handleResourceNotFound(
			ResourceNotFoundException ex,
			WebRequest request) {
		return buildError(HttpStatus.NOT_FOUND, ex.getMessage(), request);
	}

	@ExceptionHandler(InvalidRequestException.class)
	public ResponseEntity<ErrorResponseBody> handleInvalidRequest(
			InvalidRequestException ex,
			WebRequest request) {
		return buildError(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorResponseBody> handleIllegalArgument(
			IllegalArgumentException ex,
			WebRequest request) {
		return buildError(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
	}

	@ExceptionHandler(IllegalStateException.class)
	public ResponseEntity<ErrorResponseBody> handleIllegalState(
			IllegalStateException ex,
			WebRequest request) {
		return buildError(HttpStatus.CONFLICT, ex.getMessage(), request);
	}

	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<ErrorResponseBody> handleAccessDenied(
			AccessDeniedException ex,
			WebRequest request) {
		return buildError(HttpStatus.FORBIDDEN, "Access denied", request);
	}

	@ExceptionHandler(AuthenticationException.class)
	public ResponseEntity<ErrorResponseBody> handleAuthenticationException(
			AuthenticationException ex,
			WebRequest request) {
		return buildError(HttpStatus.UNAUTHORIZED, "Authentication failed: " + ex.getMessage(), request);
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ValidationErrorResponseBody> handleValidationException(
			MethodArgumentNotValidException ex,
			WebRequest request) {
		Map<String, String> errors = new HashMap<>();
		for (ObjectError error : ex.getBindingResult().getAllErrors()) {
			String key;
			if (error instanceof FieldError fieldError) {
				key = fieldError.getField();
			} else {
				key = error.getObjectName();
			}
			errors.put(key, error.getDefaultMessage());
		}

		ValidationErrorResponseBody body = ValidationErrorResponseBody.builder()
				.status(HttpStatus.BAD_REQUEST.value())
				.message("Validation failed")
				.timestamp(LocalDateTime.now())
				.path(path(request))
				.errors(errors)
				.build();
		return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ErrorResponseBody> handleGlobalException(Exception ex, WebRequest request) {
		log.error("Unhandled exception", ex);
		ErrorResponseBody body = ErrorResponseBody.builder()
				.status(HttpStatus.INTERNAL_SERVER_ERROR.value())
				.message("An unexpected error occurred")
				.timestamp(LocalDateTime.now())
				.path(path(request))
				.build();
		return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
	}

	private ResponseEntity<ErrorResponseBody> buildError(HttpStatus status, String message, WebRequest request) {
		ErrorResponseBody body = ErrorResponseBody.builder()
				.status(status.value())
				.message(message)
				.timestamp(LocalDateTime.now())
				.path(path(request))
				.build();
		return new ResponseEntity<>(body, status);
	}

	private static String path(WebRequest request) {
		return request.getDescription(false).replace("uri=", "");
	}
}

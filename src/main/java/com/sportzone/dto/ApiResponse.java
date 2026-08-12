package com.sportzone.dto;

public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;

    public ApiResponse() {}

    public ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    public static <T> ApiResponseBuilder<T> builder() {
        return new ApiResponseBuilder<>();
    }

    public static class ApiResponseBuilder<T> {
        private boolean success;
        private String message;
        private T data;

        public ApiResponseBuilder<T> success(boolean success) { this.success = success; return this; }
        public ApiResponseBuilder<T> message(String message) { this.message = message; return this; }
        public ApiResponseBuilder<T> data(T data) { this.data = data; return this; }

        public ApiResponse<T> build() {
            return new ApiResponse<>(success, message, data);
        }
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public T getData() { return data; }
    public void setData(T data) { this.data = data; }

    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success(T data) {
        return success(data, "Operation successful");
    }

    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .data(null)
                .build();
    }
}


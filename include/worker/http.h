#ifndef worker_http_H_
#define worker_http_H_
#include <stdbool.h>
#include <stddef.h>
#include <stdio.h>

#if !defined(WORKER_ASYNC)
  #define WORKER_ASYNC
#endif
#if !defined(WORKER_NULLABLE)
  #define WORKER_NULLABLE
#endif

typedef enum {
  worker_http_Method_GET = 0,
  worker_http_Method_POST,
  worker_http_Method_DELETE,
  worker_http_Method_HEAD,
  worker_http_Method_PATCH,
  worker_http_Method_PUT,
  worker_http_Method_OPTIONS,
  worker_http_Method_TRACE,
  worker_http_Method_CONNECT,
  worker_http_Method_count
} worker_http_Method;
static const char* const worker_http_methods[worker_http_Method_count] = {
  "GET", "POST", "DELETE", "HEAD", "PATCH", "PUT", "OPTIONS", "TRACE", "CONNECT",
};
typedef enum {
  worker_http_Request_Body_Type_String,
  worker_http_Request_Body_Type_Buffer,
  worker_http_Request_Body_Type_Stream,
  worker_http_Request_Body_Type_count
} worker_http_Body_Type;
typedef struct {
    worker_http_Body_Type type;
    union {
        char* string;
        void* buffer;
        FILE* stream;
    };
} worker_http_Body;
typedef struct {
    char* url;
    size_t header_count;
    char** header;
    worker_http_Method method;
    size_t size;
    worker_http_Body body;
} worker_http_Request;
typedef struct {
    size_t size;
    worker_http_Body body;
} worker_http_Response;

#endif /* worker_http_H_ */

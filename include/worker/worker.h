#ifndef worker_H_
#define worker_H_
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
    worker_http_Method method;
    size_t size;
    worker_http_Body body;
} worker_http_Request;
typedef struct {
    size_t size;
    worker_http_Body body;
} worker_http_Response;

extern void worker_log(const char* message)
  __attribute__((__import_module__("worker"), __import_name__("log")));
extern void worker_logNumber(const double value)
  __attribute__((__import_module__("worker"), __import_name__("logNumber")));
extern double worker_random()
  __attribute__((__import_module__("worker"), __import_name__("random")));
WORKER_ASYNC extern double worker_sleep(const double delay)
  __attribute__((__import_module__("worker"), __import_name__("sleep")));
typedef void (*worker_loop_function)(void*);
// adapted from emscripten_set_main_loop_arg
// rate <= 0 will default to 60
extern void worker_loop(worker_loop_function function, void* arg, int rate, bool infinite)
  __attribute__((__import_module__("worker"), __import_name__("loop")));
WORKER_ASYNC extern bool worker_KVNamespace_getText(
  const char* namespace,
  const char* key,
  char* value)
  __attribute__((__import_module__("worker"), __import_name__("KVNamespace_getText")));
WORKER_ASYNC extern bool worker_KVNamespace_getArrayBuffer(
  const char* namespace,
  const char* key,
  void* value)
  __attribute__((
    __import_module__("worker"),
    __import_name__("KVNamespace_getArrayBuffer")));
WORKER_ASYNC extern bool worker_KVNamespace_putText(
  const char* namespace,
  const char* key,
  const char* value)
  __attribute__((__import_module__("worker"), __import_name__("KVNamespace_putText")));
WORKER_ASYNC extern bool worker_KVNamespace_putArrayBuffer(
  const char* namespace,
  const char* key,
  const void* value,
  const size_t size)
  __attribute__((
    __import_module__("worker"),
    __import_name__("KVNamespace_putArrayBuffer")));
WORKER_ASYNC extern size_t worker_KVNamespace_list(
  const char* namespace,
  const size_t limit,
  char* keys[static limit],
  WORKER_NULLABLE const char* prefix,
  WORKER_NULLABLE const char* cursor)
  __attribute__((__import_module__("worker"), __import_name__("KVNamespace_list")));
WORKER_ASYNC extern bool worker_KVNamespace_delete(const char* namespace, const char* key)
  __attribute__((__import_module__("worker"), __import_name__("KVNamespace_delete")));
extern bool worker_DurableObject_Namespace_idFromName(
  const char* namespace,
  const char* name,
  char id[static 65])
  __attribute__((
    __import_module__("worker"),
    __import_name__("DurableObject_Namespace_idFromName")));
extern bool worker_DurableObject_Namespace_newUniqueId(
  const char* namespace,
  char id[static 65])
  __attribute__((
    __import_module__("worker"),
    __import_name__("DurableObject_Namespace_newUniqueId")));
WORKER_ASYNC extern bool worker_DurableObject_Stub_fetch(
  const char* namespace,
  char id[static 65],
  const char* url,
  const worker_http_Method method,
  WORKER_NULLABLE void* body,
  WORKER_NULLABLE size_t size,
  WORKER_NULLABLE void* response)
  __attribute__((__import_module__("worker"), __import_name__("DurableObject_Stub_fetch")));

#endif /* worker_H_ */

#ifndef DurableObject_H_
#define DurableObject_H_
#include <stdbool.h>
#include <stddef.h>

#if !defined(WORKER_ASYNC)
  #define WORKER_ASYNC
#endif
#if !defined(WORKER_NULLABLE)
  #define WORKER_NULLABLE
#endif

extern void worker_DurableObject_State_id(char id[static 65])
  __attribute__((__import_module__("durableObject"), __import_name__("State_id")));
WORKER_ASYNC extern void worker_DurableObject_State_Storage_put(
  const char* key,
  const void* value,
  const size_t size)
  __attribute__((__import_module__("durableObject"), __import_name__("State_Storage_put")));
WORKER_ASYNC extern bool worker_DurableObject_State_Storage_get(
  const char* key,
  const void* value)
  __attribute__((__import_module__("durableObject"), __import_name__("State_Storage_get")));
WORKER_ASYNC extern size_t worker_DurableObject_State_Storage_list(
  const size_t limit,
  void* keys[static limit],
  WORKER_NULLABLE const char* prefix)
  __attribute__((
    __import_module__("durableObject"),
    __import_name__("State_Storage_list")));
WORKER_ASYNC extern bool worker_DurableObject_State_Storage_delete(const char* key)
  __attribute__((
    __import_module__("durableObject"),
    __import_name__("State_Storage_delete")));

#endif /* DurableObject_H_ */

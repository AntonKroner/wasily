#include <stdio.h>
// #include <stdlib.h>
#include "worker/worker.h"

void logEnviron() {
  extern char** environ;
  char** s = environ;
  worker_log("environ: ");
  for (; *s; s++) {
    worker_log(*s);
  }
}
int main(int argc, char* argv[static argc]) {
  constexpr size_t size = 256;
  char buffer[size] = { 0 };
  size_t read = fread(buffer, size, 1, stdin);
  worker_log(buffer);
  for (int i = 0; argc > i; i++) {
    printf("%s\n", argv[i]);
  }
  char value[256] = { 0 };
  worker_KVNamespace_putText("kvStore", "asdf", "aaaaaaaaa");
  worker_KVNamespace_getText("kvStore", "asdf", value);
  worker_log(value);
  logEnviron();
  for (int i = 0; i < 10; i++) {
    worker_sleep(500);
    printf("const char *restrict, ...\n");
  }
  return 0;
}

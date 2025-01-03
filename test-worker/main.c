#include <stdio.h>
#include "worker/worker.h"

int main(int argc, char* argv[static argc]) {
  for (int i = 0; argc > i; i++) {
    printf("%s\n", argv[i]);
  }
  char value[256] = { 0 };
  worker_KVNamespace_putText("kvStore", "asdf", "aaaaaaaaa");
  worker_KVNamespace_getText("kvStore", "asdf", value);
  worker_log(value);
  return 0;
}

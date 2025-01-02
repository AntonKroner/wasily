WASI_SDK_PATH = ../../../wasi-sdk-25.0
CC = ${WASI_SDK_PATH}/bin/clang --sysroot=${WASI_SDK_PATH}/share/wasi-sysroot
LD = ${WASI_SDK_PATH}/bin/clang


CFLAGS = 
LDFLAGS = -Wl,--import-undefined -Wl, #--import-memory,
LIBS = 

OBJS = main.o
WASM = main.wasm
UNOPT  = unopt.o

$(WASM): $(UNOPT)
	wasm-opt -O2 --asyncify $(UNOPT) -o $(WASM)
#--pass-arg asyncify-imports@cloudly.cloudly_storage_kv_list,cloudly.cloudly_storage_kv_get,cloudly.cloudly_storage_kv_set,cloudly.cloudly_exit,wasi_snapshot_preview1.clock_time_get

$(UNOPT): $(OBJS)
	$(LD) $(LDFLAGS) $(OBJS) $(LIBS) -o $(UNOPT)

main.o: main.c
	$(CC) $(CFLAGS) -c main.c

clean:
	rm -f $(EXECUTABLE) $(OBJS) $(WASM) $(UNOPT) *~

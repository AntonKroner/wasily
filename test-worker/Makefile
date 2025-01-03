WASI_SDK_PATH = ../../../wasi-sdk-25.0
CC = ${WASI_SDK_PATH}/bin/clang --sysroot=${WASI_SDK_PATH}/share/wasi-sysroot
LD = ${WASI_SDK_PATH}/bin/clang

CFLAGS = --std=gnu2x --target=wasm32-wasip2
LDFLAGS = -Wl,--import-undefined -Wl,
LIBRARIES = 

BUILD = build
OBJECTS = main.o
WASM = main.wasm
UNOPT  = unopt.o
OBJECTS := $(addprefix $(BUILD)/,$(OBJECTS))

all: $(BUILD) $(WASM)
$(BUILD):
	mkdir -p ./$@/
$(WASM): $(BUILD)/$(UNOPT)
	wasm-opt -O2 --asyncify  $< -o $@
#--pass-arg asyncify-imports@cloudly.cloudly_storage_kv_list,cloudly.cloudly_storage_kv_get,cloudly.cloudly_storage_kv_set,cloudly.cloudly_exit,wasi_snapshot_preview1.clock_time_get
$(BUILD)/$(UNOPT): $(OBJECTS)
	$(LD) $(LDFLAGS) $(OBJECTS) $(LIBRARIES) -o $@
$(BUILD)/main.o: main.c
	$(CC) $(CFLAGS) -o $@ -c $<
clean:
	rm -f $(WASM) ./build/* *~

# disable built-in rules
.SUFFIXES:

WASI_SDK_PATH := ../../wasi-sdk-25.0
WASI_SYSROOT  := $(abspath ${WASI_SDK_PATH}/share/wasi-sysroot)
export CC      := $(abspath ${WASI_SDK_PATH}/bin/clang) -target wasm32-wasi --sysroot=${WASI_SYSROOT}
export CFLAGS  := -Oz -flto -I ./deps/rapidjson/include -I./deps/littlefs -fno-exceptions -include ./memfs/config.h
export LDFLAGS := -lstdc++ -flto -Wl,--allow-undefined
export CXXFLAGS := -std=c++20

all: memfs/memfs.wasm
clean:
	rm -rf ./dist/
	rm -rf ./build/
	rm memfs.wasm
	rm memfs/memfs.wasm

WASM_OBJ := \
	./build/obj/deps/littlefs/lfs.o \
	./build/obj/deps/littlefs/lfs_util.o \
	./build/obj/deps/littlefs/bd/lfs_rambd.o \
	./build/obj/memfs.o \
	./build/obj/util.o

HEADERS := $(wildcard ./*.h)
build/obj/%.o: %.c $(HEADERS) $(WASI_SDK_PATH)
	mkdir -p $(@D)
	$(CC) -c $(CFLAGS) $< -o $@

build/obj/memfs.o: memfs/memfs.cc $(HEADERS) $(WASI_SDK_PATH)
	$(CC) -c $(CFLAGS) $(CXXFLAGS) $< -o $@

build/obj/util.o: memfs/util.cc $(HEADERS) $(WASI_SDK_PATH)
	$(CC) -c $(CFLAGS) $(CXXFLAGS) $< -o $@

build/obj/%.o: %.cc $(HEADERS) $(WASI_SDK_PATH)
	mkdir -p $(@D)
	$(CC) -c $(CFLAGS) $(CXXFLAGS) $< -o $@

memfs/memfs.wasm: $(WASM_OBJ)
	mkdir -p $(@D)
	$(CC) $(CFLAGS) $(LDFLAGS) $(WASM_OBJ) -o $@

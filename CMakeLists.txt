cmake_minimum_required(VERSION 3.10)
project(server VERSION 1.0 LANGUAGES C)

set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)

if(NOT DEFINED ENV{MSYSTEM_PREFIX})
    set(MHD_PREFIX "C:/msys64/mingw64")
else()
    set(MHD_PREFIX "$ENV{MSYSTEM_PREFIX}")
endif()

find_path(MHD_INCLUDE_DIR microhttpd.h PATHS ${MHD_PREFIX}/include)
find_library(MHD_LIBRARY NAMES microhttpd PATHS ${MHD_PREFIX}/lib)

if(NOT MHD_INCLUDE_DIR OR NOT MHD_LIBRARY)
    message(FATAL_ERROR "libmicrohttpd nao encontrado em ${MHD_PREFIX}")
endif()

include_directories(${CMAKE_SOURCE_DIR}/include ${MHD_INCLUDE_DIR})

add_executable(${PROJECT_NAME}
    src/main.c
    src/server/server.c
    src/server/utils.c
)

target_link_libraries(${PROJECT_NAME} ${MHD_LIBRARY})

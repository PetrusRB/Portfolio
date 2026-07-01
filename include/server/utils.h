#pragma once
#include <microhttpd.h>

enum MHD_Result serve_file(struct MHD_Connection *connection, const char *path);

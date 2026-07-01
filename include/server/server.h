#pragma once
#include <microhttpd.h>
#include <stdbool.h>

#define SERVER_PORT 8000

typedef struct {
  struct MHD_Daemon *daemon;
} Server;

bool server_init(Server *server);
void server_stop(Server *server);

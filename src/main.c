#include "server/server.h"
#include <stdio.h>

int main(void) {
  Server server;

  if (!server_init(&server))
    return 1;

  printf("Pressione Enter para parar o servidor...\n");
  getchar();

  server_stop(&server);
  return 0;
}

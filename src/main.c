#include "server/server.h"
#include <stdio.h>

int main(void) {
  Server server;

  if (!server_init(&server))
    return 1;

  printf("Pressione qualquer coisa para parar o servidor (Enter é melhor)\n");
  getchar();

  server_stop(&server);
  return 0;
}

#include "server/server.h"
#include "server/utils.h"
#include <stdio.h>
#include <string.h>

typedef enum { ROUTE_FILE, ROUTE_HANDLER } TipoDeRota;

typedef enum MHD_Result (*RouteHandler)(struct MHD_Connection *connection,
                                        const char *url);
typedef struct {
  const char *caminho;
  TipoDeRota tipo;
  union {
    const char *arquivo;
    RouteHandler handler;
  };
} Rota;

static Rota rotas[] = {
    {"/", ROUTE_FILE, .arquivo = "www/src/index.html"},
};

static enum MHD_Result route_request(struct MHD_Connection *connection,
                                     const char *url) {
  for (size_t i = 0; i < sizeof(rotas) / sizeof(rotas[0]); i++) {
    if (strcmp(url, rotas[i].caminho) == 0) {
      if (rotas[i].tipo == ROUTE_FILE)
        return serve_file(connection, rotas[i].arquivo);
      return rotas[i].handler(connection, url);
    }
  }

  char caminho[512];
  snprintf(caminho, sizeof(caminho), "www%s", url);
  return serve_file(connection, caminho);
}

static enum MHD_Result ahc_echo(void *cls, struct MHD_Connection *connection,
                                const char *url, const char *method,
                                const char *version, const char *upload_data,
                                size_t *upload_data_size, void **ptr) {
  static int dummy;
  (void)cls;
  (void)version;
  (void)upload_data;

  if (strcmp(method, "GET") != 0)
    return MHD_NO;

  if (&dummy != *ptr) {
    *ptr = &dummy;
    return MHD_YES;
  }

  if (*upload_data_size != 0)
    return MHD_NO;

  *ptr = NULL;
  return route_request(connection, url);
}

bool server_init(Server *server) {
  server->daemon =
      MHD_start_daemon(MHD_USE_SELECT_INTERNALLY, SERVER_PORT, NULL, NULL,
                       &ahc_echo, NULL, MHD_OPTION_END);
  if (server->daemon == NULL) {
    fprintf(stderr, "Falha ao iniciar o servidor na porta %d\n", SERVER_PORT);
    return false;
  }
  printf("Servidor rodando na porta %d\n", SERVER_PORT);
  return true;
}

void server_stop(Server *server) {
  if (server->daemon) {
    MHD_stop_daemon(server->daemon);
    server->daemon = NULL;
    printf("Servidor parado.\n");
  }
}

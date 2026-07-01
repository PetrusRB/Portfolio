#include "server/server.h"
#include "server/utils.h"
#include <stdio.h>
#include <string.h>

typedef enum { ROUTE_FILE, ROUTE_HANDLER } RouteType;

typedef enum MHD_Result (*RouteHandler)(struct MHD_Connection *connection,
                                        const char *url);
typedef struct {
  const char *path;
  RouteType type;
  union {
    const char *file;
    RouteHandler handler;
  };
} Route;

static Route routes[] = {
    {"/", ROUTE_FILE, .file = "www/src/index.html"},
};

static enum MHD_Result route_request(struct MHD_Connection *connection,
                                     const char *url) {
  for (size_t i = 0; i < sizeof(routes) / sizeof(routes[0]); i++) {
    if (strcmp(url, routes[i].path) == 0) {
      if (routes[i].type == ROUTE_FILE)
        return serve_file(connection, routes[i].file);
      return routes[i].handler(connection, url);
    }
  }

  char path[512];
  snprintf(path, sizeof(path), "www%s", url);
  return serve_file(connection, path);
}

static enum MHD_Result ahc_echo(void *cls, struct MHD_Connection *connection,
                                const char *url, const char *method,
                                const char *version, const char *upload_data,
                                size_t *upload_data_size, void **ptr) {
  static int dummy;
  (void)cls;
  (void)version;
  (void)upload_data;

  // compara o método que esta sendo requisitado com o método GET.
  // se não for método get então recusa.
  if (strcmp(method, "GET") != 0)
    return MHD_NO;

  // dizer que esta processando.
  if (&dummy != *ptr) {
    *ptr = &dummy;
    return MHD_YES;
  }

  // métodos get's não podem ser feitos upload.
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

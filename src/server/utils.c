#include "server/utils.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static const char *get_mime(const char *url) {
  const char *ext = strrchr(url, '.');
  if (!ext)
    return "text/plain";
  if (strcmp(ext, ".html") == 0)
    return "text/html";
  if (strcmp(ext, ".css") == 0)
    return "text/css";
  if (strcmp(ext, ".js") == 0)
    return "application/javascript";
  return "text/plain";
}

enum MHD_Result serve_file(struct MHD_Connection *connection,
                           const char *path) {
  FILE *fp = fopen(path, "rb");
  if (!fp) {
    const char *page = "<html><body><h1>404 Not Found</h1></body></html>";
    struct MHD_Response *response = MHD_create_response_from_buffer(
        strlen(page), (void *)page, MHD_RESPMEM_PERSISTENT);
    MHD_add_response_header(response, "Content-Type", "text/html");
    enum MHD_Result ret =
        MHD_queue_response(connection, MHD_HTTP_NOT_FOUND, response);
    MHD_destroy_response(response);
    return ret;
  }

  fseek(fp, 0, SEEK_END); // vai pro inicio
  long size = ftell(
      fp); // pega a quantidade de bytes que tem o arquivo após ir pro final.
  fseek(fp, 0, SEEK_SET); // volta pro começo

  char *buffer = malloc(size);
  if (!buffer) {
    fclose(fp);
    return MHD_NO;
  }

  fread(buffer, 1, size, fp);
  fclose(fp);

  struct MHD_Response *response =
      MHD_create_response_from_buffer(size, buffer, MHD_RESPMEM_MUST_FREE);
  MHD_add_response_header(response, "Content-Type", get_mime(path));

  enum MHD_Result ret = MHD_queue_response(connection, MHD_HTTP_OK, response);
  MHD_destroy_response(response);
  return ret;
}

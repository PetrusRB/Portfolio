#include "server/utils.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static const struct {
  const char *ext;
  const char *type;
} mime_table[] = {
    {".html", "text/html"},
    {".css", "text/css"},
    {".js", "application/javascript"},
    {".md", "text/markdown"},
    {".ico", "image/x-icon"},
    {".png", "image/png"},
    {".jpg", "image/jpeg"},
    {".jpeg", "image/jpeg"},
    {".svg", "image/svg+xml"},
    {".woff2", "font/woff2"},
    {".woff", "font/woff"},
    {".json", "application/json"},
};

static const char *get_mime(const char *url) {
  const char *ext = strrchr(url, '.');
  if (!ext)
    return "text/plain";

  for (size_t i = 0; i < sizeof(mime_table) / sizeof(mime_table[0]); i++) {
    if (strcmp(ext, mime_table[i].ext) == 0)
      return mime_table[i].type;
  }

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

  fseek(fp, 0, SEEK_END);
  long size = ftell(fp);
  fseek(fp, 0, SEEK_SET);

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

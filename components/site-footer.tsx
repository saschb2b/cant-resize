import NextLink from "next/link";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { Heart, ExternalLink } from "lucide-react";

const linkSx = {
  color: "text.secondary",
  textDecoration: "none",
  typography: "caption",
  "&:hover": { color: "text.primary" },
} as const;

interface SiteFooterProps {
  /** "default" for normal pages, "canvas" for the viewer workspace. */
  variant?: "default" | "canvas";
}

export function SiteFooter({ variant = "default" }: SiteFooterProps) {
  const compact = variant === "canvas";

  return (
    <Box
      component="footer"
      sx={{ mt: compact ? 0 : "auto", position: "relative", zIndex: 1 }}
    >
      <Box sx={{ borderTop: 1, borderColor: "divider" }}>
        <Container
          maxWidth={compact ? false : "lg"}
          disableGutters={compact}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent={compact ? "center" : "space-between"}
            spacing={compact ? 2 : { xs: 1.5, sm: 1 }}
            sx={{
              py: compact ? 0.5 : 2,
              px: compact ? 2 : 0,
              flexWrap: compact ? "nowrap" : { xs: "wrap", sm: "nowrap" },
            }}
          >
            {!compact && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                Made with
                <Box
                  component="span"
                  sx={{ color: "error.main", display: "inline-flex" }}
                >
                  <Heart size={12} fill="currentColor" />
                </Box>
                by{" "}
                <Box
                  component="a"
                  href="https://saschb2b.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: "text.secondary",
                    textDecoration: "none",
                    fontWeight: 600,
                    "&:hover": { color: "text.primary" },
                  }}
                >
                  Sascha
                </Box>
              </Typography>
            )}

            <Stack direction="row" alignItems="center" spacing={2}>
              {compact ? (
                <NextLink href="/" style={{ textDecoration: "none" }}>
                  <Box sx={linkSx}>Home</Box>
                </NextLink>
              ) : (
                <NextLink href="/canvas" style={{ textDecoration: "none" }}>
                  <Box sx={linkSx}>Viewer</Box>
                </NextLink>
              )}
              <NextLink href="/learn" style={{ textDecoration: "none" }}>
                <Box sx={linkSx}>Learn</Box>
              </NextLink>
              <Box
                component="a"
                href="https://github.com/saschb2b/cant-resize"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  ...linkSx,
                }}
              >
                GitHub
                <ExternalLink size={10} />
              </Box>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}

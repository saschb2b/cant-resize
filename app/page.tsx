import NextLink from "next/link";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import {
  ArrowRight,
  Monitor,
  Smartphone,
  Tablet,
  MousePointerClick,
  ScrollText,
  Move,
  ExternalLink,
  Heart,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";

export default function LandingPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      <SiteHeader />

      {/* Hero */}
      <Container
        maxWidth="lg"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          pt: { xs: 8, md: 12 },
          pb: { xs: 6, md: 10 },
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems="center"
          spacing={{ xs: 6, md: 10 }}
        >
          {/* Left — title, subtitle, CTA */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              textAlign: { xs: "center", md: "left" },
            }}
          >
            <Typography
              variant="h3"
              component="h1"
              fontWeight={700}
              sx={{
                lineHeight: 1.15,
                mb: 2,
                fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
              }}
            >
              One site.
              <br />
              <Box component="span" sx={{ color: "primary.main" }}>
                Every screen.
              </Box>
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                lineHeight: 1.7,
                mb: 4,
                maxWidth: 440,
                mx: { xs: "auto", md: 0 },
                fontSize: { xs: "0.95rem", md: "1.05rem" },
              }}
            >
              Preview any URL across phones, tablets, and desktops
              simultaneously. Scroll, click, and navigate — synced across every
              viewport in real time.
            </Typography>

            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
              sx={{ justifyContent: { xs: "center", md: "flex-start" } }}
            >
              <NextLink href="/canvas" style={{ textDecoration: "none" }}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowRight size={18} />}
                  sx={{
                    px: { xs: 3, md: 5 },
                    py: { xs: 1, md: 1.5 },
                    fontSize: { xs: "0.95rem", md: "1.05rem" },
                  }}
                >
                  Open Viewer
                </Button>
              </NextLink>
            </Stack>
            <Typography
              variant="caption"
              color="text.secondary"
              fontFamily="var(--font-geist-mono), monospace"
              sx={{
                mt: 1.5,
                display: "block",
                textAlign: { xs: "center", md: "left" },
              }}
            >
              free &middot; no signup &middot; works with localhost
            </Typography>
          </Box>

          {/* Right — device preview illustration */}
          <Box sx={{ flex: 1, minWidth: 0, maxWidth: 480, width: "100%" }}>
            <Paper
              elevation={0}
              sx={{
                border: 1,
                borderColor: "divider",
                overflow: "hidden",
                p: { xs: 3, md: 4 },
              }}
            >
              <Stack
                direction="row"
                spacing={2}
                alignItems="flex-end"
                justifyContent="center"
              >
                {/* Phone */}
                <Stack alignItems="center" spacing={1}>
                  <Paper
                    elevation={0}
                    sx={{
                      width: 56,
                      height: 100,
                      border: 2,
                      borderColor: "divider",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "action.hover",
                    }}
                  >
                    <Smartphone size={20} />
                  </Paper>
                  <Typography variant="caption" color="text.secondary">
                    375px
                  </Typography>
                </Stack>
                {/* Tablet */}
                <Stack alignItems="center" spacing={1}>
                  <Paper
                    elevation={0}
                    sx={{
                      width: 90,
                      height: 120,
                      border: 2,
                      borderColor: "divider",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "action.hover",
                    }}
                  >
                    <Tablet size={24} />
                  </Paper>
                  <Typography variant="caption" color="text.secondary">
                    768px
                  </Typography>
                </Stack>
                {/* Desktop */}
                <Stack alignItems="center" spacing={1}>
                  <Paper
                    elevation={0}
                    sx={{
                      width: 140,
                      height: 90,
                      border: 2,
                      borderColor: "primary.main",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "action.hover",
                    }}
                  >
                    <Monitor size={28} />
                  </Paper>
                  <Typography variant="caption" color="text.secondary">
                    1920px
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          </Box>
        </Stack>
      </Container>

      {/* Features */}
      <Box
        sx={{
          bgcolor: "action.hover",
          borderTop: 1,
          borderBottom: 1,
          borderColor: "divider",
          py: { xs: 5, md: 6 },
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h5"
            component="h2"
            fontWeight={600}
            sx={{ textAlign: "center", mb: 1 }}
          >
            Everything stays in sync
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", mb: 4 }}
          >
            Interact with one viewport — all others follow along.
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            {[
              {
                icon: <ScrollText size={20} />,
                title: "Scroll sync",
                desc: "Scroll position mirrors across all viewports instantly.",
              },
              {
                icon: <MousePointerClick size={20} />,
                title: "Click & hover",
                desc: "Clicks and hover states replicate to every device.",
              },
              {
                icon: <Move size={20} />,
                title: "Drag & resize",
                desc: "Freeform canvas with draggable, resizable device frames.",
              },
            ].map((feature) => (
              <Paper
                key={feature.title}
                elevation={0}
                sx={{
                  flex: 1,
                  p: 2.5,
                  border: 1,
                  borderColor: "divider",
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    bgcolor: "action.selected",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "text.primary",
                    mb: 1.5,
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                  {feature.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.5 }}
                >
                  {feature.desc}
                </Typography>
              </Paper>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* Open source CTA */}
      <Container
        maxWidth="lg"
        sx={{ py: { xs: 5, md: 7 } }}
      >
        <Paper
          elevation={0}
          sx={{
            border: 1,
            borderColor: "divider",
            px: { xs: 3, md: 5 },
            py: { xs: 3, md: 4 },
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems="center"
            spacing={{ xs: 2, md: 4 }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" component="p" fontWeight={600}>
                Open source
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.7, mt: 0.5 }}
              >
                Built with Next.js, Material UI, and TypeScript. Contributions
                welcome.
              </Typography>
            </Box>
            <NextLink
              href="https://github.com/saschb2b/cant-resize"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none", flexShrink: 0 }}
            >
              <Button
                variant="outlined"
                size="medium"
                startIcon={<ExternalLink size={16} />}
                sx={{
                  px: 3,
                  borderColor: "divider",
                  color: "text.primary",
                  fontWeight: 600,
                  "&:hover": {
                    borderColor: "text.secondary",
                    bgcolor: "action.hover",
                  },
                }}
              >
                View on GitHub
              </Button>
            </NextLink>
          </Stack>
        </Paper>
      </Container>

      {/* Footer */}
      <Box component="footer" sx={{ mt: "auto" }}>
        <Box sx={{ borderTop: 1, borderColor: "divider" }}>
          <Container maxWidth="lg">
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems="center"
              justifyContent="space-between"
              spacing={{ xs: 1.5, sm: 1 }}
              sx={{ py: 2 }}
            >
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

              <Stack direction="row" alignItems="center" spacing={2}>
                <NextLink href="/canvas" style={{ textDecoration: "none" }}>
                  <Box
                    sx={{
                      color: "text.secondary",
                      textDecoration: "none",
                      typography: "caption",
                      "&:hover": { color: "text.primary" },
                    }}
                  >
                    Viewer
                  </Box>
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
                    color: "text.secondary",
                    textDecoration: "none",
                    typography: "caption",
                    "&:hover": { color: "text.primary" },
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
    </Box>
  );
}

import { styled } from "@mui/material/styles";

const StyledGrid = styled(Grid)(({ theme }) => ({
  height: "100vh",
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  margin: theme.spacing(8, 4),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  margin: theme.spacing(1),
  backgroundColor: theme.palette.primary.main,
}));

const StyledForm = styled("form")(({ theme }) => ({
  width: "100%",
  marginTop: theme.spacing(1),
}));

const StyledLink = styled(Link)(({ theme }) => ({
  color: theme.palette.primary.main,
  textDecoration: "none",
}));

const GoogleButton = styled(GoogleLogin)(({ theme }) => ({
  width: "100%",
  justifyContent: "center",
  marginTop: theme.spacing(2),
}));

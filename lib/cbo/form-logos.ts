export const FORM_LOGO_FILES = {
  dswd: "DSWD LOGO.png",
  epahp: "EPAHP LOGO.png",
  bagongPilipinas: "EPAHP BP LOGO.png",
} as const;

export const FORM_LOGO_PATHS = {
  dswd: `/logos/${FORM_LOGO_FILES.dswd}`,
  epahp: `/logos/${FORM_LOGO_FILES.epahp}`,
  bagongPilipinas: `/logos/${FORM_LOGO_FILES.bagongPilipinas}`,
} as const;

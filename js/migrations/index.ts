import v020 from './v020';

const CURRENT_VERSION = "v0.2.0";

export const runMigrations = () => {
  const version = localStorage.getItem("version") ?? CURRENT_VERSION;
  if(version < CURRENT_VERSION) {
    v020(version);
  }
  localStorage.setItem("version", CURRENT_VERSION);
}
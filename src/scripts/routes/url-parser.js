/**
 * Mengekstrak bagian dari jalur URL
 * @param {string} path - Jalur URL yang akan diproses
 * @returns {Object} Objek yang berisi sumber daya dan id
 */
function extractPathnameSegments(path) {
  const splitUrl = path.split('/');

  return {
    resource: splitUrl[1] || null,
    id: splitUrl[2] || null,
  };
}

/**
 * Membuat rute dari bagian jalur
 * @param {Object} pathSegments - Bagian jalur yang akan diproses
 * @returns {string} Rute yang sudah dibuat
 */
function constructRouteFromSegments(pathSegments) {
  let pathname = '';

  if (pathSegments.resource) {
    pathname = pathname.concat(`/${pathSegments.resource}`);
  }

  if (pathSegments.id) {
    pathname = pathname.concat('/:id');
  }

  return pathname || '/';
}

/**
 * Mendapatkan jalur aktif dari hash URL
 * @returns {string} Jalur aktif
 */
export function getActivePathname() {
  return location.hash.replace('#', '') || '/';
}

/**
 * Mendapatkan rute aktif berdasarkan hash URL
 * @returns {string} Rute aktif
 */
export function getActiveRoute() {
  const pathname = getActivePathname();
  const urlSegments = extractPathnameSegments(pathname);
  return constructRouteFromSegments(urlSegments);
}

/**
 * Memisahkan jalur aktif menjadi bagian-bagian
 * @returns {Object} Bagian-bagian dari jalur aktif
 */
export function parseActivePathname() {
  const pathname = getActivePathname();
  return extractPathnameSegments(pathname);
}

/**
 * Mendapatkan rute dari jalur
 * @param {string} pathname - Jalur yang akan diproses
 * @returns {string} Rute yang sesuai
 */
export function getRoute(pathname) {
  const urlSegments = extractPathnameSegments(pathname);
  return constructRouteFromSegments(urlSegments);
}

/**
 * Memisahkan jalur menjadi bagian-bagian
 * @param {string} pathname - Jalur yang akan diproses
 * @returns {Object} Bagian-bagian dari jalur
 */
export function parsePathname(pathname) {
  return extractPathnameSegments(pathname);
}

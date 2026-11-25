/* ==========================================================================
   Run the builder
   ========================================================================== */

(async () => {
  try {
    const fontInfo = await initFonts();
    createStyles();

    const website = figma.createPage();
    website.name = 'Summit — Website';
    await figma.setCurrentPageAsync(website);

    const screens = [];
    const home = await buildHome(0);
    screens.push([home, '01 · Home — Desktop']);

    const services = buildServices(1600);
    screens.push([services, '02 · Services — Desktop']);

    const doctors = buildDoctorsPage(3200);
    screens.push([doctors, '03 · Doctors — Desktop']);

    const appointment = buildAppointmentPage(4800);
    screens.push([appointment, '04 · Appointment — Desktop']);

    const contact = buildContactPage(6400);
    screens.push([contact, '05 · Contact — Desktop']);

    const about = buildAboutPage(8000);
    screens.push([about, '06 · About — Desktop']);

    const visit = buildVisitPage(9600);
    screens.push([visit, '07 · Your visit — Desktop']);

    const mobileHome = buildMobileHome();
    screens.push([mobileHome, '08 · Home — Mobile']);

    const mobileAppointment = buildMobileAppointment();
    screens.push([mobileAppointment, '09 · Appointment — Mobile']);

    for (const [screen, label] of screens) {
      addText(figma.currentPage, `Screen label / ${label}`, label, screen.x, -64, 900, {
        font: FONT.sansSemi,
        size: 18,
        color: C.soft,
        lineHeight: 100,
        letterSpacing: 0.6,
      });
    }

    const designPage = figma.createPage();
    designPage.name = 'Summit — Design system';
    await figma.setCurrentPageAsync(designPage);
    buildDesignSystem();

    await figma.setCurrentPageAsync(website);
    figma.viewport.scrollAndZoomIntoView([home]);

    const fallback = fontInfo.fallback
      ? ` Fraunces/Manrope were not available, so ${fontInfo.serifFamily} and ${fontInfo.sansFamily} were used instead.`
      : '';
    figma.notify(`Summit design created: 9 screens plus a design system.${fallback}`, { timeout: 20000 });
    figma.closePlugin('Summit design created.');
  } catch (error) {
    console.error(error);
    figma.notify(`Could not create the Summit design: ${error.message}`, { error: true, timeout: 30000 });
    figma.closePlugin('Summit design failed.');
  }
})();

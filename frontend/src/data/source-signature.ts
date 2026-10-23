// Signatur im Quelltext (HTML-Kommentar im <head>). Kein sichtbarer Inhalt.
// Der Kommentartext darf keine doppelten Bindestriche enthalten.
const lines = [
  '',
  '#   #  ####   #####   ###   #####  #####  #   #  ####   #####   ####  #   #',
  '#  #   #   #  #      #   #    #      #    #   #  #   #  #      #      #  #',
  '###    ####   ####   #####    #      #    #   #  #   #  ####   #      ###',
  '#  #   #  #   #      #   #    #      #     # #   #   #  #      #      #  #',
  '#   #  #   #  #####  #   #    #    #####    #    ####   #####   ####  #   #',
  '',
  'Konzeption, Design & Entwicklung',
  'www.kreativdeck.de',
  '',
];

export const sourceSignature = `<!--\n${lines.join('\n')}\n-->`;

# Katalog-Paketierer

Zerlegt eine große Katalog-Sammelmappe (PDF) in kleine Teilpakete, die nur die Seiten der gesuchten Produkte enthalten, und führt die Excel-Ergebnisse der einzelnen Pakete wieder zusammen. Gedacht für die Katalog-Textrückführung mit Langdock.

Das Werkzeug läuft vollständig im Browser. Die PDF und die Produktliste verlassen das Gerät nicht; dieses Repo enthält nur den Programmcode.

## Einbindung

```html
<div id="paketierer"></div>
<script src="https://cdn.jsdelivr.net/gh/Unfuture/katalog-paketierer@1/paketierer.js"></script>
```

`index.html` ist genau dieser Lader. In Langdock legt der Skill „Katalog-Textrückführung“ ihn als HTML-Dokument im Dokument-Editor an.

## Abhängigkeiten

Werden zur Laufzeit von cdnjs geladen: pdf.js 3.11.174, pdf-lib 1.17.1, JSZip 3.10.1, ExcelJS 4.4.0. Schriften: Geist und Instrument Serif über Google Fonts.

## Neue Version veröffentlichen

1. `paketierer.js` ändern, `VERSION` hochzählen.
2. Commit, dann Tag setzen: `git tag v1.0.1 && git push --tags`.
3. Der Lader nutzt `@1` und erhält damit automatisch die neueste 1.x-Version. jsDelivr cachet bis zu 7 Tage; sofort aktualisieren mit `https://purge.jsdelivr.net/gh/Unfuture/katalog-paketierer@1/paketierer.js`.

Inkompatible Änderungen bekommen eine neue Hauptversion (`v2.0.0`) und einen angepassten Lader im Skill.

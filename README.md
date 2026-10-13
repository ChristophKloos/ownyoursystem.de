# Distro Picker

A Linux distro picker: answer a short set of questions about your workflow, hardware and
preferences, and get matched with fitting distributions and desktop environments.

Live: https://distro.ownyoursystem.de/

Built with SvelteKit (Svelte 5, runes) and TypeScript, prerendered to static files.
Feel free to contribute or fork if you feel like improving on it.

## Development

Requires Node.js 20+.

```sh
npm install
npm run dev       # start the dev server
npm run build     # production build, output in build/
npm run preview   # preview the production build
npm run check     # svelte-check (types)
npm run lint      # prettier + eslint
npm run format    # prettier --write
```

The picker's data (questions, distros, desktops, tags) lives in `static/data/*.json`.

## License

This program is free software: you can redistribute it and/or modify it under the terms
of the GNU General Public License as published by the Free Software Foundation, either
version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program.
If not, see https://www.gnu.org/licenses/.

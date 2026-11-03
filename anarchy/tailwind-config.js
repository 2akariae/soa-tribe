tailwind.config = {
  corePlugins: { preflight: false },
  theme: { extend: {
    colors: { gold: 'var(--gold)', ink: 'var(--text)', muted: 'var(--muted)', panel: 'var(--panel)', line: 'var(--line)', danger: 'var(--danger)', ok: 'var(--ok)' },
    fontFamily: { display: ['Reem Kufi', 'serif'], body: ['IBM Plex Sans Arabic', 'sans-serif'] }
  } }
};

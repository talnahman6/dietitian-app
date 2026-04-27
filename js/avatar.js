const AVATAR_SVG = `<svg viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="rbg" cx="50%" cy="40%" r="55%">
    <stop offset="0%" stop-color="#1e2d45"/>
    <stop offset="100%" stop-color="#080c14"/>
  </radialGradient>
  <linearGradient id="rbody" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#253550"/>
    <stop offset="100%" stop-color="#162032"/>
  </linearGradient>
</defs>
<!-- BG -->
<circle cx="130" cy="130" r="130" fill="url(#rbg)"/>
<!-- ANTENNA -->
<rect x="126" y="40" width="8" height="30" rx="4" fill="#6366f1"/>
<circle cx="130" cy="36" r="11" fill="#6366f1"/>
<circle cx="130" cy="36" r="5.5" fill="#a5b4fc"/>
<!-- HEAD -->
<rect x="66" y="68" width="128" height="104" rx="24" fill="url(#rbody)" stroke="#2e4268" stroke-width="2"/>
<!-- EYE SOCKETS -->
<rect x="83" y="87" width="38" height="30" rx="11" fill="#080c14"/>
<rect x="139" y="87" width="38" height="30" rx="11" fill="#080c14"/>
<!-- EYES GLOW -->
<circle cx="102" cy="102" r="11" fill="#6366f1"/>
<circle cx="158" cy="102" r="11" fill="#6366f1"/>
<circle cx="97" cy="97" r="4" fill="white" opacity=".85"/>
<circle cx="153" cy="97" r="4" fill="white" opacity=".85"/>
<!-- MOUTH DISPLAY -->
<rect x="88" y="133" width="84" height="24" rx="7" fill="#080c14"/>
<path d="M96 151 Q130 136 164 151" stroke="#10b981" stroke-width="4" fill="none" stroke-linecap="round"/>
<!-- EAR BOLTS -->
<circle cx="66" cy="112" r="10" fill="#253550" stroke="#6366f1" stroke-width="2.5"/>
<circle cx="194" cy="112" r="10" fill="#253550" stroke="#6366f1" stroke-width="2.5"/>
<!-- NECK -->
<rect x="114" y="172" width="32" height="22" rx="7" fill="#253550"/>
<!-- BODY -->
<rect x="70" y="192" width="120" height="82" rx="20" fill="url(#rbody)" stroke="#2e4268" stroke-width="2"/>
<!-- BODY PANEL -->
<rect x="92" y="206" width="76" height="56" rx="12" fill="#080c14"/>
<!-- MEDICAL CROSS (green) -->
<rect x="121" y="216" width="18" height="36" rx="5" fill="#10b981" opacity=".75"/>
<rect x="111" y="226" width="38" height="16" rx="5" fill="#10b981" opacity=".75"/>
<!-- SHOULDER BOLTS -->
<circle cx="80" cy="204" r="6" fill="#2e4268" stroke="#6366f1" stroke-width="1.5"/>
<circle cx="180" cy="204" r="6" fill="#2e4268" stroke="#6366f1" stroke-width="1.5"/>
</svg>`;

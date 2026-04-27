const AVATAR_SVG = `<svg viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="dbg" cx="50%" cy="35%" r="60%">
    <stop offset="0%" stop-color="#1e2d45"/>
    <stop offset="100%" stop-color="#080c14"/>
  </radialGradient>
</defs>
<!-- BG -->
<circle cx="130" cy="130" r="130" fill="url(#dbg)"/>
<!-- WHITE COAT BODY -->
<path d="M0 260 L0 200 Q55 178 92 173 L115 190 L130 182 L145 190 L168 173 Q205 178 260 200 L260 260 Z" fill="#dde4f0"/>
<!-- COAT LAPELS -->
<path d="M115 190 L104 172 L117 222" fill="white"/>
<path d="M145 190 L156 172 L143 222" fill="white"/>
<!-- GREEN SCRUB TOP -->
<path d="M117 190 L130 182 L143 190 L141 224 L119 224 Z" fill="#059669"/>
<!-- NECK -->
<rect x="116" y="156" width="28" height="26" rx="5" fill="#e8b88a"/>
<!-- HEAD -->
<ellipse cx="130" cy="112" rx="56" ry="60" fill="#e8b88a"/>
<!-- EARS -->
<ellipse cx="74" cy="114" rx="11" ry="15" fill="#e8b88a"/>
<ellipse cx="186" cy="114" rx="11" ry="15" fill="#e8b88a"/>
<ellipse cx="74" cy="114" rx="6" ry="9" fill="#d4956e" opacity=".5"/>
<ellipse cx="186" cy="114" rx="6" ry="9" fill="#d4956e" opacity=".5"/>
<!-- HAIR -->
<ellipse cx="130" cy="68" rx="60" ry="32" fill="#1c0f08"/>
<path d="M72 98 Q74 48 130 44 Q186 48 188 98 Q170 62 130 60 Q90 62 72 98 Z" fill="#1c0f08"/>
<path d="M74 98 Q62 124 64 156 Q68 168 76 176 Q82 162 80 140 Q78 114 82 99 Z" fill="#1c0f08"/>
<path d="M186 98 Q198 124 196 156 Q192 168 184 176 Q178 162 180 140 Q182 114 178 99 Z" fill="#1c0f08"/>
<!-- EYES WHITE -->
<ellipse cx="109" cy="108" rx="12" ry="13" fill="white"/>
<ellipse cx="151" cy="108" rx="12" ry="13" fill="white"/>
<!-- IRIS -->
<circle cx="110" cy="109" r="9" fill="#3d2010"/>
<circle cx="152" cy="109" r="9" fill="#3d2010"/>
<!-- PUPIL -->
<circle cx="110" cy="109" r="5.5" fill="#0d0805"/>
<circle cx="152" cy="109" r="5.5" fill="#0d0805"/>
<!-- EYE SHINE -->
<circle cx="113" cy="106" r="3" fill="white" opacity=".85"/>
<circle cx="155" cy="106" r="3" fill="white" opacity=".85"/>
<!-- EYEBROWS -->
<path d="M96 96 Q109 89 123 94" stroke="#1c0f08" stroke-width="4.5" fill="none" stroke-linecap="round"/>
<path d="M137 94 Q151 89 164 96" stroke="#1c0f08" stroke-width="4.5" fill="none" stroke-linecap="round"/>
<!-- NOSE -->
<path d="M126 120 Q130 131 134 120" stroke="#c47d50" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<ellipse cx="124" cy="129" rx="5" ry="3" fill="#c47d50" opacity=".35"/>
<ellipse cx="136" cy="129" rx="5" ry="3" fill="#c47d50" opacity=".35"/>
<!-- SMILE + TEETH -->
<path d="M112 142 Q130 158 148 142" stroke="#b85c44" stroke-width="4" fill="none" stroke-linecap="round"/>
<path d="M116 143 Q130 154 144 143 Q130 151 116 143 Z" fill="white" opacity=".9"/>
<!-- CHEEK BLUSH -->
<ellipse cx="92" cy="130" rx="15" ry="10" fill="#f09090" opacity=".28"/>
<ellipse cx="168" cy="130" rx="15" ry="10" fill="#f09090" opacity=".28"/>
<!-- EARRINGS (purple accent) -->
<circle cx="74" cy="126" r="5.5" fill="#6366f1"/>
<circle cx="74" cy="126" r="2.5" fill="#a5b4fc"/>
<circle cx="186" cy="126" r="5.5" fill="#6366f1"/>
<circle cx="186" cy="126" r="2.5" fill="#a5b4fc"/>
<!-- STETHOSCOPE (green accent) -->
<path d="M102 188 Q94 203 99 217 Q107 233 120 229" stroke="#10b981" stroke-width="4.5" fill="none" stroke-linecap="round"/>
<circle cx="120" cy="229" r="7" fill="#10b981" opacity=".8"/>
<path d="M102 188 Q108 184 114 188" stroke="#10b981" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>`;

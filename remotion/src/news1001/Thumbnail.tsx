import React from 'react';
import {HighlightThumb} from '../thumbs/HighlightThumb';
import {C} from './design';

/*
 * YouTube thumbnails for AI News, 1 Oct 2026, in the approved style (SOP "Thumbnails").
 * Lead story: the FTC's probe of OpenAI, Anthropic and other labs. Fictional people only (generated),
 * no real person, no logos. Ink = the paper-collage design system's darkest colour.
 */
export const N1ThumbA: React.FC = () => <HighlightThumb src="news1001/thumb/probe.jpg" words={['FEDS', 'VS', 'AI']} style="marker" ink={C.ink} />;
export const N1ThumbB: React.FC = () => <HighlightThumb src="news1001/thumb/probe.jpg" words={['FEDS', 'VS', 'AI']} style="highlighter" ink={C.ink} />;
export const N1ThumbC: React.FC = () => <HighlightThumb src="news1001/thumb/tax.jpg" words={['$355M', 'TAX', 'BREAK']} style="marker" ink={C.ink} />;

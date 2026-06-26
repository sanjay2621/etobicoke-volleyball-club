import { Tooltip } from '@mui/material';

interface Props {
  text: string | number | null | undefined;
}

/** Truncates text to its container width with ellipsis and shows the full value in a tooltip. */
export function TruncatedText({ text }: Props) {
  const str = text == null ? '—' : String(text);
  return (
    <Tooltip title={str} placement="top" enterDelay={300}>
      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {str}
      </span>
    </Tooltip>
  );
}

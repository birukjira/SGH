type IconProps = {
  name: string;
  className?: string;
};

/** Icon from the shared SVG sprite compiled from src/partials/icons.html. */
export function Icon({ name, className = 'icon' }: IconProps) {
  // Sprite symbols are all prefixed (i-arrow); accept either spelling so
  // D1 rows and hand-written props resolve to the same symbol.
  const symbol = name.startsWith('i-') ? name : `i-${name}`;

  return (
    <svg className={className} aria-hidden="true" focusable="false">
      <use href={`/sprite.svg#${symbol}`} />
    </svg>
  );
}

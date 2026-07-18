'use client';

export function PrintButton() {
  return (
    <button className="btn btn-dark" onClick={() => window.print()}>
      Print or save PDF
    </button>
  );
}

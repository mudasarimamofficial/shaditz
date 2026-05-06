"use client";

import type { ReactNode } from "react";
import { Component } from "react";

type Props = {
  children: ReactNode;
  label: string;
};

type State = {
  hasError: boolean;
};

export class SectionErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="mx-auto w-full max-w-7xl px-6 py-10">
          <div className="rounded-2xl border border-[var(--cf-border)] bg-[var(--cf-surface)] p-6 text-sm text-slate-200">
            Section failed to render: {this.props.label}
          </div>
        </section>
      );
    }
    return this.props.children;
  }
}


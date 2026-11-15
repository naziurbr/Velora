"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  fallback: ReactNode | ((error: Error) => ReactNode);
  onError?: (error: Error) => void;
  children: ReactNode;
}

export class ErrorBoundary extends Component<Props, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    this.props.onError?.(error);
  }

  render() {
    const { error } = this.state;
    if (error) {
      const { fallback } = this.props;
      return typeof fallback === "function" ? fallback(error) : fallback;
    }
    return this.props.children;
  }
}

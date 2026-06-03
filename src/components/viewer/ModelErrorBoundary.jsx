import { Component } from "react";

class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ModelErrorBoundary] 3D view error:", error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 rounded-2xl overflow-hidden border border-hairline bg-canvas m-4 md:m-6 md:mx-3 flex items-center justify-center">
          <div className="bg-canvas rounded-xl p-8 border border-hairline text-center max-w-sm">
            <p className="text-muted text-sm mb-2">3D 视图加载失败</p>
            <p className="text-muted-soft text-xs mb-5">
              {this.state.error?.message || "未知错误"}
            </p>
            <button
              onClick={this.handleRetry}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-primary text-on-primary hover:bg-primary-active transition-colors cursor-pointer"
            >
              重新加载
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ModelErrorBoundary;

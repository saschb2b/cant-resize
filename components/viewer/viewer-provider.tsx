"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type {
  ViewerState,
  ViewerAction,
  Viewport,
  CanvasTransform,
  LayoutMode,
  SyncSettings,
} from "@/lib/viewer/types";
import { getDeviceById } from "@/lib/viewer/device-presets";

const STORAGE_KEY = "responsive-viewer-state";

const defaultSyncSettings: SyncSettings = {
  scroll: true,
  mouse: true,
  click: true,
  hover: true,
  navigation: true,
};

const initialState: ViewerState = {
  url: "https://example.com",
  viewports: [],
  layoutMode: "freeform",
  canvasTransform: { x: 0, y: 0, scale: 0.5 },
  selectedViewportId: null,
  scrollPosition: 0,
  syncSettings: defaultSyncSettings,
};

function viewerReducer(state: ViewerState, action: ViewerAction): ViewerState {
  switch (action.type) {
    case "SET_URL":
      return { ...state, url: action.url };
    case "ADD_VIEWPORT":
      return {
        ...state,
        viewports: [...state.viewports, action.viewport],
      };
    case "REMOVE_VIEWPORT":
      return {
        ...state,
        viewports: state.viewports.filter((v) => v.id !== action.id),
        selectedViewportId:
          state.selectedViewportId === action.id
            ? null
            : state.selectedViewportId,
      };
    case "UPDATE_VIEWPORT":
      return {
        ...state,
        viewports: state.viewports.map((v) =>
          v.id === action.id ? { ...v, ...action.updates } : v,
        ),
      };
    case "SELECT_VIEWPORT":
      return { ...state, selectedViewportId: action.id };
    case "SET_LAYOUT_MODE":
      return { ...state, layoutMode: action.mode };
    case "SET_CANVAS_TRANSFORM":
      return { ...state, canvasTransform: action.transform };
    case "SET_SCROLL_POSITION":
      return { ...state, scrollPosition: action.position };
    case "TOGGLE_ORIENTATION": {
      return {
        ...state,
        viewports: state.viewports.map((v) => {
          if (v.id !== action.id) return v;
          const newOrientation =
            v.orientation === "portrait" ? "landscape" : "portrait";
          return {
            ...v,
            orientation: newOrientation,
            width: v.height,
            height: v.width,
          };
        }),
      };
    }
    case "LOAD_STATE":
      return {
        ...action.state,
        syncSettings: action.state.syncSettings,
      };
    case "SET_SYNC_SETTINGS":
      return {
        ...state,
        syncSettings: { ...state.syncSettings, ...action.settings },
      };
    default:
      return state;
  }
}

interface ViewerContextValue {
  state: ViewerState;
  dispatch: React.Dispatch<ViewerAction>;
  addViewport: (deviceId: string, position?: { x: number; y: number }) => void;
  addCustomViewport: (width: number, height: number) => void;
  removeViewport: (id: string) => void;
  setUrl: (url: string) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  setCanvasTransform: (transform: CanvasTransform) => void;
  selectViewport: (id: string | null) => void;
  toggleOrientation: (id: string) => void;
  broadcastScroll: (position: number, sourceId: string) => void;
  broadcastMouse: (x: number, y: number, sourceId: string) => void;
  broadcastClick: (
    x: number,
    y: number,
    selector: string,
    sourceId: string,
  ) => void;
  broadcastHover: (selector: string, sourceId: string) => void;
  broadcastNavigation: (url: string, sourceId: string) => void;
  setSyncSettings: (settings: Partial<SyncSettings>) => void;
}

const ViewerContext = createContext<ViewerContextValue | null>(null);

export function ViewerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(viewerReducer, initialState);

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<ViewerState>;
        dispatch({
          type: "LOAD_STATE",
          state: { ...initialState, ...parsed },
        });
      } catch {
        // Invalid saved state, use default
      }
    }
  }, []);

  // Save state to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addViewport = useCallback(
    (deviceId: string, position?: { x: number; y: number }) => {
      const device = getDeviceById(deviceId);
      if (!device) return;

      const viewport: Viewport = {
        id: `viewport-${String(Date.now())}-${Math.random().toString(36).slice(2, 9)}`,
        deviceId,
        x: position?.x ?? Math.random() * 200,
        y: position?.y ?? Math.random() * 200,
        width: device.width,
        height: device.height,
        orientation: "portrait",
        scale: 1,
      };
      dispatch({ type: "ADD_VIEWPORT", viewport });
    },
    [],
  );

  const addCustomViewport = useCallback((width: number, height: number) => {
    const viewport: Viewport = {
      id: `viewport-${String(Date.now())}-${Math.random().toString(36).slice(2, 9)}`,
      deviceId: `custom-${String(width)}x${String(height)}`,
      x: Math.random() * 200,
      y: Math.random() * 200,
      width,
      height,
      orientation: "portrait",
      scale: 1,
    };
    dispatch({ type: "ADD_VIEWPORT", viewport });
  }, []);

  const removeViewport = useCallback((id: string) => {
    dispatch({ type: "REMOVE_VIEWPORT", id });
  }, []);

  const setUrl = useCallback((url: string) => {
    dispatch({ type: "SET_URL", url });
  }, []);

  const setLayoutMode = useCallback((mode: LayoutMode) => {
    dispatch({ type: "SET_LAYOUT_MODE", mode });
  }, []);

  const setCanvasTransform = useCallback((transform: CanvasTransform) => {
    dispatch({ type: "SET_CANVAS_TRANSFORM", transform });
  }, []);

  const selectViewport = useCallback((id: string | null) => {
    dispatch({ type: "SELECT_VIEWPORT", id });
  }, []);

  const toggleOrientation = useCallback((id: string) => {
    dispatch({ type: "TOGGLE_ORIENTATION", id });
  }, []);

  const broadcastToViewports = useCallback(
    (message: object, sourceId: string) => {
      const iframes = document.querySelectorAll<HTMLIFrameElement>(
        "[data-viewport-iframe]",
      );
      iframes.forEach((iframe) => {
        if (iframe.dataset.viewportId !== sourceId) {
          iframe.contentWindow?.postMessage(message, "*");
        }
      });
    },
    [],
  );

  const broadcastScroll = useCallback(
    (position: number, sourceId: string) => {
      if (!state.syncSettings.scroll) return;
      dispatch({ type: "SET_SCROLL_POSITION", position });
      broadcastToViewports({ type: "SCROLL_TO", scrollY: position }, sourceId);
    },
    [state.syncSettings.scroll, broadcastToViewports],
  );

  const broadcastMouse = useCallback(
    (x: number, y: number, sourceId: string) => {
      if (!state.syncSettings.mouse) return;
      broadcastToViewports(
        { type: "MOUSE_MOVE", mouseX: x, mouseY: y },
        sourceId,
      );
    },
    [state.syncSettings.mouse, broadcastToViewports],
  );

  const broadcastClick = useCallback(
    (x: number, y: number, selector: string, sourceId: string) => {
      if (!state.syncSettings.click) return;
      broadcastToViewports(
        { type: "CLICK", mouseX: x, mouseY: y, selector },
        sourceId,
      );
    },
    [state.syncSettings.click, broadcastToViewports],
  );

  const broadcastHover = useCallback(
    (selector: string, sourceId: string) => {
      if (!state.syncSettings.hover) return;
      broadcastToViewports({ type: "HOVER", selector }, sourceId);
    },
    [state.syncSettings.hover, broadcastToViewports],
  );

  const broadcastNavigation = useCallback(
    (url: string, sourceId: string) => {
      if (!state.syncSettings.navigation) return;
      broadcastToViewports({ type: "NAVIGATE", url }, sourceId);
    },
    [state.syncSettings.navigation, broadcastToViewports],
  );

  const setSyncSettings = useCallback((settings: Partial<SyncSettings>) => {
    dispatch({ type: "SET_SYNC_SETTINGS", settings });
  }, []);

  return (
    <ViewerContext.Provider
      value={{
        state,
        dispatch,
        addViewport,
        addCustomViewport,
        removeViewport,
        setUrl,
        setLayoutMode,
        setCanvasTransform,
        selectViewport,
        toggleOrientation,
        broadcastScroll,
        broadcastMouse,
        broadcastClick,
        broadcastHover,
        broadcastNavigation,
        setSyncSettings,
      }}
    >
      {children}
    </ViewerContext.Provider>
  );
}

export function useViewer() {
  const context = useContext(ViewerContext);
  if (!context) {
    throw new Error("useViewer must be used within a ViewerProvider");
  }
  return context;
}

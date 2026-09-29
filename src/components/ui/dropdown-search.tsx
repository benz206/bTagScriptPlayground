"use client";

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from "react";
import { cn } from "@/lib/utils";
import { useIcon } from "@/lib/icon-context";
import { useSize } from "@/lib/size-context";
import { useSurface } from "@/lib/surface-context";
import { SURFACE_BG } from "@/lib/surface-classes";

// ---------------------------------------------------------------------------
// Search inside a dropdown menu.
//
// DropdownSearch is a text field pinned to the top of a DropdownContent popup.
// It is controlled: the consumer filters the MenuItems it renders against
// `value`, so the list can be re-indexed freely (fluid hover keys on the
// indices of whatever is currently mounted). Two things make a field inside a
// menu behave:
//
//   1. The menu primitive's typeahead must not steal keystrokes from the
//      field — every typing key stops propagating at the input.
//   2. Typing while a ROW is focused must land in the field: the popup
//      hosts a capture-phase keydown handler (useDropdownSearchHost) that
//      refocuses the input and appends the character.
//
// Arrow keys leave the field for the list (first / last row), Enter picks
// the first row, Escape closes the menu as usual. While the field has focus
// the first row carries the hover background, so what Enter will pick is
// always in view; it follows the query as the rows re-filter.
// ---------------------------------------------------------------------------

interface SearchHandle {
  input: HTMLInputElement | null;
  append: (text: string) => void;
  deleteBackward: () => void;
}

interface DropdownSearchHostValue {
  register: (handle: SearchHandle) => () => void;
  /** Whether the popup is open. Popups stay mounted through their exit
   *  animation, so the field watches this rather than its own mount. */
  open: boolean;
  /** Move the hover background to the first enabled row (what Enter picks). */
  highlightFirst: () => void;
}

export const DropdownSearchHostContext =
  createContext<DropdownSearchHostValue | null>(null);

const ROW_SELECTOR = [
  '[role="menuitem"]:not([aria-disabled="true"])',
  '[role="menuitemradio"]:not([aria-disabled="true"])',
  '[role="menuitemcheckbox"]:not([aria-disabled="true"])',
].join(", ");

function menuRows(from: HTMLElement | null): HTMLElement[] {
  const menu = from?.closest<HTMLElement>('[role="menu"]');
  return menu ? Array.from(menu.querySelectorAll<HTMLElement>(ROW_SELECTOR)) : [];
}

interface DropdownSearchHostOptions {
  /** The rows' container: where the first enabled row is looked up. */
  containerRef: RefObject<HTMLElement | null>;
  /** The popup's fluid-hover setter, for the first-row highlight. */
  setActiveIndex: (index: number | null) => void;
}

/**
 * Hosts a DropdownSearch inside a popup. Returns the context value to
 * provide, a capture-phase keydown handler for the popup element,
 * `hasSearch()` / `searchMounted` for decisions that depend on a field
 * being present, and the first-row highlight the field keeps while it has
 * focus (`isSearchField` / `highlightFirst`, for the popup's focus and
 * mouse-leave handlers).
 */
export function useDropdownSearchHost(
  open: boolean,
  { containerRef, setActiveIndex }: DropdownSearchHostOptions
) {
  const handleRef = useRef<SearchHandle | null>(null);
  // Reactive twin of the ref, for render-time decisions (the popup drops its
  // scroll fade while a field is pinned at the top).
  const [searchMounted, setSearchMounted] = useState(false);

  const register = useCallback((handle: SearchHandle) => {
    handleRef.current = handle;
    setSearchMounted(true);
    return () => {
      if (handleRef.current === handle) {
        handleRef.current = null;
        setSearchMounted(false);
      }
    };
  }, []);

  // The row Enter will pick carries the hover background while the field
  // has focus. Rows re-index from 0 on every filter, so this is looked up
  // in the DOM each time rather than remembered.
  const highlightFirst = useCallback(() => {
    const first = containerRef.current?.querySelector<HTMLElement>(ROW_SELECTOR);
    const index = first?.getAttribute("data-fluid-hover-index");
    setActiveIndex(index != null ? Number(index) : null);
  }, [containerRef, setActiveIndex]);

  /** Whether `target` is the mounted search field. */
  const isSearchField = useCallback(
    (target: EventTarget | null) =>
      target !== null && target === handleRef.current?.input,
    []
  );

  const host = useMemo(
    () => ({ register, open, highlightFirst }),
    [register, open, highlightFirst]
  );

  // Typing on a focused row: redirect the character (or Backspace) into the
  // field. Space is left alone — on a row it activates the item, which is
  // what a menu user expects once they have arrowed down.
  const onKeyDownCapture = useCallback((e: ReactKeyboardEvent<HTMLElement>) => {
    const handle = handleRef.current;
    if (!handle?.input) return;
    if (e.target === handle.input) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key.length === 1 && e.key !== " ") {
      e.preventDefault();
      e.stopPropagation();
      handle.input.focus();
      handle.append(e.key);
    } else if (e.key === "Backspace") {
      e.preventDefault();
      e.stopPropagation();
      handle.input.focus();
      handle.deleteBackward();
    }
  }, []);

  /** Whether a search field is mounted in the popup right now. */
  const hasSearch = useCallback(() => handleRef.current !== null, []);

  return {
    host,
    hasSearch,
    searchMounted,
    onKeyDownCapture,
    isSearchField,
    highlightFirst,
  };
}

// ---------------------------------------------------------------------------
// DropdownSearch
// ---------------------------------------------------------------------------

export interface DropdownSearchProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "size" | "defaultValue"
  > {
  /** The query. Filter the MenuItems you render against it. */
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  /** Reset the query to "" when the popup closes (the field unmounts with
   *  it), so the menu reopens unfiltered. @default true */
  clearOnClose?: boolean;
  /** Take focus when the popup opens. @default true */
  autoFocus?: boolean;
}

const DropdownSearch = forwardRef<HTMLInputElement, DropdownSearchProps>(
  (
    {
      value,
      onValueChange,
      placeholder = "Search…",
      clearOnClose = true,
      autoFocus = true,
      className,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const SearchIcon = useIcon("search");
    const sizeClasses = useSize();
    const compact = sizeClasses.variant === "compact";
    const host = useContext(DropdownSearchHostContext);
    // Outside a popup host (an inline panel) the field is simply open.
    const open = host?.open ?? true;
    // The popup surface, painted explicitly: rows scroll underneath the sticky
    // field, and the field's parent is often a display:contents group (the
    // menu's radio group) that `bg-inherit` would resolve to transparent.
    const surface = useSurface();
    const inputRef = useRef<HTMLInputElement | null>(null);

    // Latest value / callback for the imperative handle and the unmount
    // cleanup, without re-registering on every keystroke.
    const valueRef = useRef(value);
    valueRef.current = value;
    const onValueChangeRef = useRef(onValueChange);
    onValueChangeRef.current = onValueChange;
    const clearOnCloseRef = useRef(clearOnClose);
    clearOnCloseRef.current = clearOnClose;

    useEffect(() => {
      if (!host) return;
      return host.register({
        get input() {
          return inputRef.current;
        },
        append: (text) => onValueChangeRef.current(valueRef.current + text),
        deleteBackward: () =>
          onValueChangeRef.current(valueRef.current.slice(0, -1)),
      });
    }, [host]);

    // On every open (mount, or a reopen while the popup was still playing
    // its exit): reset the query so the list starts unfiltered, then take
    // focus. The popup's own initial focus (first row on a keyboard open,
    // the panel on a pointer open) is queued a frame after mount; the field
    // takes over one frame later so a menu with a search opens ready to type.
    useEffect(() => {
      if (!open) return;
      if (clearOnCloseRef.current && valueRef.current !== "") {
        onValueChangeRef.current("");
      }
      if (!autoFocus) return;
      let inner: number | undefined;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => inputRef.current?.focus());
      });
      return () => {
        cancelAnimationFrame(outer);
        if (inner !== undefined) cancelAnimationFrame(inner);
      };
    }, [open, autoFocus]);

    // The rows re-filter in the same commit as the query, so after it the
    // first enabled row is whatever Enter would pick now: highlight it while
    // the field has focus. (Focus arriving at the field is the popup's
    // onFocus; this covers the query moving under a focused field.)
    useEffect(() => {
      if (!host || document.activeElement !== inputRef.current) return;
      host.highlightFirst();
    }, [host, value]);

    // Unmount (the popup finished closing): reset the query so the next
    // open shows the full list.
    useEffect(
      () => () => {
        if (clearOnCloseRef.current && valueRef.current !== "") {
          onValueChangeRef.current("");
        }
      },
      []
    );

    const handleKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;
      // Escape and Tab belong to the menu (close / leave). Everything else is
      // either typing, which the menu's typeahead must not see, or list
      // navigation handled right here.
      if (e.key === "Escape" || e.key === "Tab") return;
      e.stopPropagation();
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        const rows = menuRows(e.currentTarget);
        if (rows.length === 0) return;
        e.preventDefault();
        (e.key === "ArrowDown" ? rows[0] : rows[rows.length - 1]).focus();
      } else if (e.key === "Enter") {
        e.preventDefault();
        menuRows(e.currentTarget)[0]?.click();
      }
    };

    return (
      <div
        // Sticky at the top of the scrolling popup, bleeding into its 4px
        // padding so the divider runs edge to edge and rows scroll underneath
        // it; margin + the list gap put the first row 4px below the divider —
        // the same inset as the popup's side padding.
        className={cn(
          "group/search sticky top-0 z-20 -mx-1 -mt-1 mb-0.5 flex shrink-0 items-center border-b border-border/60",
          SURFACE_BG[surface],
          sizeClasses.control,
          sizeClasses.gap,
          compact ? "px-2.5" : "px-3",
          className
        )}
      >
        <SearchIcon
          size={sizeClasses.icon}
          strokeWidth={1.5}
          className="shrink-0 text-muted-foreground transition-[color,stroke-width] duration-80 group-focus-within/search:text-foreground group-focus-within/search:stroke-[2]"
        />
        <input
          ref={(node) => {
            inputRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
          }}
          type="text"
          role="searchbox"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          // rounded-none: the site's base :focus-visible rule hands focused
          // elements the shape radius, and a text input clips its caret to
          // its own corners (pill mode nicks the caret at the left edge).
          className={cn(
            "min-w-0 flex-1 rounded-none bg-transparent text-foreground placeholder:text-muted-foreground outline-none font-[inherit]",
            sizeClasses.text,
            // The line box: Safari runs the caret its full height, so the
            // ladder's leading keeps it in proportion to the row. (Chrome
            // sizes the caret to the font itself, whatever the leading.)
            compact ? "leading-5" : "leading-6"
          )}
          {...props}
        />
      </div>
    );
  }
);

DropdownSearch.displayName = "DropdownSearch";

// ---------------------------------------------------------------------------
// DropdownEmpty — the "no results" row a filtered menu shows instead of items.
// ---------------------------------------------------------------------------

const DropdownEmpty = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const sizeClasses = useSize();
    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        className={cn(
          "px-2 py-6 text-center text-muted-foreground",
          sizeClasses.text,
          className
        )}
        {...props}
      />
    );
  }
);

DropdownEmpty.displayName = "DropdownEmpty";

export { DropdownSearch, DropdownEmpty };

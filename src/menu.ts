import * as b from 'bobril';
import { List } from './list';

export interface IMenuData {
    children?: b.IBobrilChildren;
    desktop?: boolean;
    initiallyKeyboardFocused?: boolean;
    maxHeight?: number;
    onEscKeyDown?: () => void;
    onKeyDown?: () => void;
    style?: b.IBobrilStyleDef;
}

interface IMenuCtx extends b.IBobrilCtx {
    data: IMenuData;
    focusIndex: number;
    isKeyboardFocused: boolean;
    keyWidth: number;
}

function decrementKeyboardFocusIndex(ctx: IMenuCtx) {
    let index = ctx.focusIndex;
    let lastValidIndex = ctx.focusIndex;
    if (!(ctx.data.children instanceof Array))
        return;

    const children = <b.IBobrilChildArray>ctx.data.children;

    do {
        index--;
        if (index < 0) index = 0;

        if (isValidChild(<b.IBobrilNode>children[index])) {
            lastValidIndex = index;
            break;
        }

    } while (index !== 0)

    setFocusIndex(ctx, lastValidIndex, true);
}

function handleKeyDown(ctx: IMenuCtx, event: b.IKeyDownUpEvent) {
    switch (event.which) {
        case 27:
            ctx.data.onEscKeyDown && ctx.data.onEscKeyDown();
            break;
        case 9:
            if (event.shift)
                decrementKeyboardFocusIndex(ctx);
            else
                incrementKeyboardFocusIndex(ctx);
            break;
        case 38:
            decrementKeyboardFocusIndex(ctx);
            break;
        case 40:
            incrementKeyboardFocusIndex(ctx);
            break;
    }
    if (ctx.data.onKeyDown) ctx.data.onKeyDown();
};

function incrementKeyboardFocusIndex(ctx: IMenuCtx) {
    let index = ctx.focusIndex;
    let lastValidIndex = ctx.focusIndex;
    if (!(ctx.data.children instanceof Array))
        return;

    const children = <b.IBobrilChildArray>ctx.data.children;

    do {
        index++;
        if (index > children.length - 1) index = children.length - 1;

        if (isValidChild(<b.IBobrilNode>children[index])) {
            lastValidIndex = index;
            break;
        }

    } while (index !== children.length - 1)

    setFocusIndex(ctx, lastValidIndex, true);
}

function isValidChild(child: b.IBobrilNode): boolean {
    return (child.component == null || child.component.id !== 'Divider') && (child.data && !child.data.disabled);
}

function setFocusIndex(ctx: IMenuCtx, newIndex: number, isKeyboardFocused: boolean) {
    ctx.focusIndex = newIndex;
    ctx.isKeyboardFocused = isKeyboardFocused;
    b.invalidate(ctx);
}

function setWidth(ctx: IMenuCtx, element: HTMLElement) {
    const elWidth = element.offsetWidth;
    const keyWidth = ctx.keyWidth;
    const minWidth = keyWidth * 1.5;
    let keyIncrements = elWidth / keyWidth;
    let newWidth;

    keyIncrements = keyIncrements <= 1.5 ? 1.5 : Math.ceil(keyIncrements);
    newWidth = keyIncrements * keyWidth;

    if (newWidth < minWidth) newWidth = minWidth;

    element.style.width = `${newWidth}px`;
}

export const Menu = b.createComponent<IMenuData>({
    init(ctx: IMenuCtx) {
        const d = ctx.data;

        ctx.focusIndex = 0;
        ctx.isKeyboardFocused = d.initiallyKeyboardFocused || false;
        ctx.keyWidth = d.desktop ? 64 : 56;
    },
    render(ctx: IMenuCtx, me: b.IBobrilNode) {
        const d = ctx.data;

        if (d.children instanceof Array) {
            (<b.IBobrilChildArray>d.children).forEach((child: any, i: number) => {
                if (child.component.id === 'menuItem') {
                    child.data.isKeyboardFocused = ctx.isKeyboardFocused && i === ctx.focusIndex;
                }
            });
        }

        me.children = b.styledDiv(List({}, d.children), {
            maxHeight: d.maxHeight,
            overflowY: d.maxHeight ? 'auto' : undefined,
        }, d.style);
    },
    postInitDom(ctx: IMenuCtx, _me: b.IBobrilCacheNode, element: HTMLElement) {
        setWidth(ctx, element);
    },
    postUpdateDomEverytime(ctx: IMenuCtx, _me: b.IBobrilCacheNode, element: HTMLElement) {
        setWidth(ctx, element);
    },
    onPointerUp(ctx: IMenuCtx, _ev: b.IBobrilPointerEvent): boolean {
        ctx.isKeyboardFocused = false;
        return true;
    },
    onKeyDown(ctx: IMenuCtx, event: b.IKeyDownUpEvent): boolean {
        handleKeyDown(ctx, event);
        return true;
    }
});

import * as b from 'bobril';
import * as ripple from './ripple';
import * as styles from './styles';
import * as c from './styleConsts';
import * as transitions from './transitions';

export interface IIconButtonData {
    children?: b.IBobrilChildren;
    action?: () => void;
    disableTouchRipple?: boolean;
    disabled?: boolean;
    tooltip?: b.IBobrilNode;
    tabindex?: number;

    onFocus?: () => void;
    onBlur?: () => void;
    //TODO add tooltip
}

interface IIconButtonCtx extends b.IBobrilCtx {
    data: IIconButtonData;
    focusFromKeyboard: boolean;
}

let rootStyle = b.styleDef([c.positionRelative, {
    boxSizing: 'border-box',
    overflow: 'visible',
    transition: transitions.easeOut(),
    padding: styles.iconSize / 2,
    width: styles.iconSize * 2,
    height: styles.iconSize * 2,
    fontSize: 0
}]);

let iconStyle = b.styleDef({
    color: styles.textColor,
    fill: styles.textColor
});

let enabledStyle = b.styleDef([c.userSelectNone, {
    overflow: 'hidden',
    cursor: 'pointer'
}], { focus: { outline: 'none' } });

let disabledStyle = b.styleDef({
    color: styles.disabledColor,
    fill: styles.disabledColor,
});

export const IconButton = b.createComponent<IIconButtonData>({
    init(ctx: IIconButtonCtx) {
        ctx.focusFromKeyboard = false;
    },
    render(ctx: IIconButtonCtx, me: b.IBobrilNode) {
        let d = ctx.data;
        me.attrs = {
            role: 'button',
            'aria-disabled': d.disabled ? 'true' : 'false',
            tabindex: d.disabled ? undefined : (d.tabindex || 0)
        };
        b.style(me, d.disabled ? disabledStyle : enabledStyle);
        me.children = ripple.Ripple({
            pulse: ctx.focusFromKeyboard && !d.disabled,
            pointerDown: () => { if (d.action) d.action(); },
            disabled: d.disabled,
            style: [rootStyle, iconStyle, { backgroundColor: ctx.focusFromKeyboard ? styles.hoverColor : undefined }]
        }, d.children);
    },
    onKeyDown(ctx: IIconButtonCtx, ev: b.IKeyDownUpEvent): boolean {
        if ((ev.which === 13 || ev.which === 32) && !ctx.data.disabled && ctx.focusFromKeyboard) {
            if (ctx.data.action) ctx.data.action();
            return true;
        }
        return false;
    },
    onFocus(ctx: IIconButtonCtx) {
        ctx.focusFromKeyboard = true;
        if (ctx.data.onFocus) ctx.data.onFocus();
        b.invalidate(ctx);
    },
    onBlur(ctx: IIconButtonCtx) {
        ctx.focusFromKeyboard = false;
        if (ctx.data.onBlur) ctx.data.onBlur();
        b.invalidate(ctx);
    }
});

/**
 * Единая шкала отступов, скруглений и кеглей — порт ui/theme/WMTokens.kt
 * и Typography.kt с Android.
 *
 * Зачем: до этого каждый экран задавал свои числа «на глаз», и один и тот же
 * элемент на iPhone и на Android выглядел по-разному — то отступ 16 против 12,
 * то радиус 10 против 18. Токены убирают эту разницу в одном месте: правишь
 * здесь — меняется везде.
 *
 * ⚠️ Числа НЕ придумывать. Каждое значение взято из соответствующего файла
 * Android-клиента, ссылка указана рядом. Появилось новое — сначала посмотри,
 * есть ли оно в WMTokens.kt.
 *
 * Про единицы: в Compose это dp/sp, в React Native — «точки», у которых тот же
 * физический смысл (плотность-независимые пиксели), поэтому числа переносятся
 * один в один без пересчёта.
 */

/** Шкала отступов — WMSpacing */
export const Spacing = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,

  // Карточка (стиль WorldMates) — так свёрстан список чатов
  cardOuterH: 12,
  cardGapV: 3,
  cardInnerH: 12,
  cardInnerV: 9,

  // Строка списка (стиль Telegram)
  listItemH: 16,
  listItemV: 10,

  // Отступ от аватара до текста
  avatarGap: 12,
  avatarGapLg: 14,
} as const;

/** Скругления — WMCorners */
export const Radius = {
  sm: 8,
  md: 12,
  card: 16,
  avatar: 16,
  avatarLg: 18,
  lg: 20,
  pill: 999,        // в Compose RoundedCornerShape(50) = «таблетка»
  searchBar: 28,
  bottomSheet: 20,  // только верхние углы
  badge: 6,
  chip: 8,
} as const;

/**
 * Пузырь сообщения — messages/BubbleStyles.kt.
 *
 * Углы разные в зависимости от места в группе сообщений: у одиночного и у
 * последнего в группе есть «хвост» (маленький угол со стороны отправителя),
 * у соседних внутри группы углы поджаты. Именно это даёт узнаваемый
 * телеграм-подобный вид, которого на iOS не было — там был один радиус на всё.
 */
export const Bubble = {
  large: 18,   // BUBBLE_LARGE
  group: 6,    // BUBBLE_GROUP — угол, примыкающий к соседнему сообщению
  tail: 4,     // BUBBLE_TAIL  — «хвост» у последнего в группе
  maxWidth: 280,          // widthIn(max = 280.dp) в MessagesScreen.kt
  paddingH: 12,
  paddingTop: 8,
  paddingBottom: 6,
  rowPaddingH: 16,        // padding(horizontal = 16.dp) у строки сообщения
  rowGapV: 2,
} as const;

/**
 * Кегли — Typography.kt.
 * Названия соответствуют ролям Material 3, чтобы легко сверяться с Android.
 */
export const FontSize = {
  displaySmall: 36,
  headlineLarge: 32,
  headlineMedium: 28,   // заголовок экрана входа
  headlineSmall: 24,    // заголовок карточки формы
  titleLarge: 22,
  titleMedium: 17,      // имя чата в списке
  titleSmall: 16,       // текст сообщения
  bodyLarge: 16,
  bodyMedium: 15,       // подзаголовок на входе
  bodySmall: 14,        // превью последнего сообщения
  labelLarge: 13,
  labelMedium: 12,      // время
  labelSmall: 11,       // бейдж непрочитанного
} as const;

/** Начертания. В Compose FontWeight.SemiBold = 600, Medium = 500. */
export const FontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

/** Размеры аватаров — сверено с ModernChatsUI.kt и MessagesHeaderComponents.kt */
export const AvatarSize = {
  chatList: 60,
  messageHeader: 40,
  story: 52,
  small: 32,
} as const;

/**
 * Углы пузыря под конкретное место в группе.
 * Порт bubbleShape() из BubbleStyles.kt — включая асимметрию для своих и чужих.
 */
export function bubbleRadii(isOwn: boolean, isFirstInGroup = true, isLastInGroup = true) {
  const { large, group, tail } = Bubble;
  return isOwn
    ? {
        borderTopLeftRadius: large,
        borderTopRightRadius: isFirstInGroup ? large : group,
        borderBottomLeftRadius: large,
        borderBottomRightRadius: isLastInGroup ? tail : group,
      }
    : {
        borderTopLeftRadius: isFirstInGroup ? large : group,
        borderTopRightRadius: large,
        borderBottomLeftRadius: isLastInGroup ? tail : group,
        borderBottomRightRadius: large,
      };
}

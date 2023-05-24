//  https://gist.github.com/hansputera/1c1f2fc3007cbedba478463446d0fb29#file-telegram-d-ts
// Copied only for InlineKeyboardMarkup

export interface SendMessageOption {
    parse_mode?: ParseMode;
    disable_web_page_preview?: boolean;
    entities?: MessageEntity[];
    disable_notification?: boolean;
    reply_to_message_id?: number;
    reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;
    allow_sending_without_reply?: boolean;
}

export interface InlineQuery {
    id: string;
    from: User;
    location?: Location;
    query: string;
    offset: string;
    chat_type: ChatType;
}

export interface KeyboardButtonPollType {
    type: string;
}

export interface LoginUrl {
    url: string;
    forward_text?: string;
    bot_username?: string;
    request_write_access?: boolean;
}

export interface InlineKeyboardMarkup {
    inline_keyboard: InlineKeyboardButton[][];
}

export interface KeyboardButton {
    text: string;
    request_contact?: boolean;
    request_location?: boolean;
    request_poll?: KeyboardButtonPollType;
}

export interface InlineKeyboardButton {
    text: string;
    url?: string;
    login_url?: LoginUrl;
    callback_data?: string;
    switch_inline_query?: string;
    switch_inline_query_current_chat?: string;
    pay?: boolean;
}

export interface ReplyKeyboardMarkup {
    keyboard: KeyboardButton[][];
    resize_keyboard?: boolean;
    one_time_keyboard?: boolean;
    selective?: boolean;
}

export interface ReplyKeyboardRemove {
    remove_keyboard: boolean;
    selective?: boolean;
}

export interface ForceReply {
    force_reply: boolean;
    selective?: boolean;
    input_field_placeholder?: string;
}

export interface Chat {
    id: number;
    type: ChatType;
    title?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    bio?: string;
}

export interface PhotoSize {
    file_id: string;
    width: number;
    height: number;
    file_size?: number;
    file_unique_id: string;
}

export interface MaskPosition {
    point: Point;
    x_shift: number;
    y_shift: number;
    scale: number;
}

export interface Audio {
    file_id: string;
    duration?: number;
    performer?: string;
    title?: string;
    mime_type?: string;
    file_size?: number;
    file_name?: string;
    file_unique_id: string;
    thumb?: PhotoSize;
}

export interface Document {
    file_id: string;
    mime_type?: string;
    file_size?: number;
    file_name?: string;
    file_unique_id: string;
    thumb?: PhotoSize;
}

export interface Sticker {
    file_id: string;
    width: number;
    height: number;
    file_size?: number;
    file_unique_id: string;
    thumb?: PhotoSize;
    is_animated: boolean;
    emoji?: string;
    set_name?: string;
    mask_position?: MaskPosition;
}

export interface Video {
    file_id: string;
    width: number;
    height: number;
    duration: number;
    thumb?: PhotoSize;
    mime_type?: string;
    file_size?: number;
    file_unique_id: string;
}

export type Animation = Video; // aliases

export interface VideoNote {
    file_id: string;
    length: number;
    duration: number;
    thumb?: PhotoSize;
    file_size?: number;
    file_unique_id: string;
}

export interface Voice {
    file_id: string;
    duration: number;
    mime_type?: string;
    file_size?: number;
    file_unique_id: string;
}

export interface Contact {
    phone_number: string;
    first_name: string;
    last_name?: string;
    user_id?: number;
    vcard?: string;
}

export interface Location {
    longitude: number;
    latitude: number;
    horizontal_accuracy?: number;
    live_period?: number;
    heading?: number;
    proximity_alert_radius?: number;
}

export interface Game {
    title: string;
    description: string;
    photo: PhotoSize[];
    text?: string;
    text_entities?: MessageEntity[];
    animation?: Animation;
}

export interface Dice {
    emoji: string;
    value: number;
}

export interface Venue {
    location: Location;
    title: string;
    address: string;
    foursquare_id?: string;
    foursquare_type?: string;
    google_place_id?: string;
    google_place_type?: GooglePlaceTypes;
}

export interface ProximityAlertTriggered {
    traveler: User;
    watcher: User;
    distance: number;
}

export interface Invoice {
    title: string;
    description: string;
    start_parameter: string;
    currency: SupportedCurrencies;
    total_amount: number;
}

export interface ShippingAddress {
    country_code: string;
    state: string;
    city: string;
    street_line1: string;
    street_line2: string;
    post_code: string;
}

export interface OrderInfo {
    name?: string;
    phone_number?: string;
    email?: string;
    shipping_address?: ShippingAddress;
}

export interface SuccessfulPayment {
    currency: SupportedCurrencies;
    total_amount: number;
    invoice_payload: string;
    shipping_option_id?: string;
    order_info?: OrderInfo;
    telegram_payment_charge_id?: string;
    provider_payment_charge_id?: string;
}

export interface PassportFile {
    file_id: string;
    file_size: number;
    file_date: number;
    file_unique_id: string;
}

export interface EncryptedCredentials {
    data: string;
    hash: string;
    secret: string;
}

export interface EncryptedPassportElement {
    type: EncryptedPassportElementType;
    data?: string;
    phone_number?: string;
    email?: string;
    files?: PassportFile[];
    front_side?: PassportFile;
    reverse_side?: PassportFile;
    selfie?: PassportFile;
    translation?: PassportFile[];
    hash: string;
}

export interface PassportData {
    data: EncryptedPassportElement[];
    credentials: EncryptedCredentials;
}

export interface PollOption {
    text: string;
    voter_count: number;
}

export interface Poll {
    id: string;
    question: string;
    options: PollOption[];
    total_voter_count: number;
    is_closed: boolean;
    is_anonymous: boolean;
    type: PollType;
    allows_multiple_answers: boolean;
    correct_option_id?: string;
    explanation?: string;
    explanation_entities?: MessageEntity[];
    open_period?: number;
    close_date?: number;
}

export interface MessageAutoDeleteTimerChanged {
    message_auto_delete_time: number;
}

export interface VoiceChatScheduled {
    start_date: number;
}

export interface VoiceChatEnded {
    duration: number;
}

export interface VoiceChatParticipantsInvited {
    users?: User[];
}

export interface UserProfilePhotos {
    total_count: number;
    photos: PhotoSize[][];
}

export interface File {
    file_id: string;
    file_size?: number;
    file_path?: string;
    file_unique_id: string;
}

export interface CallbackQuery {
    id: string;
    from: User;
    message: Message;
    inline_message_id?: string;
    chat_instance: string;
    data?: string;
    game_short_name?: string;
}

export interface ChatPhoto {
    small_file_id: string;
    big_file_id: string;
    big_file_unique_id: string;
    small_file_unique_id: string;
}

export interface ChatInviteLink {
    invite_link: string;
    creator: User;
    is_primary: boolean;
    is_revoked: boolean;
    expire_date: number;
    member_limit: number;
}

export interface ChatMemberOwner {
    status: "creator";
    user: User;
    is_anonymous: boolean;
    custom_title?: string;
}

export interface ChatMemberAdministrator {
    status: "administrator";
    user: User;
    is_anonymous: boolean;
    custom_title?: string;
    can_be_edited: boolean;
    can_change_info: boolean;
    can_post_messages: boolean;
    can_edit_messages: boolean;
    can_delete_messages: boolean;
    can_invite_users: boolean;
    can_restrict_members: boolean;
    can_pin_messages: boolean;
    can_promote_members: boolean;
    can_manage_voice_chats: boolean;
    can_manage_chat: boolean;
}

export interface ChatMemberMember {
    status: "member";
    user: User;
}

export interface ChatMemberRestricted {
    status: "restricted";
    user: User;
    until_date: number;
    is_member: boolean;
    can_change_info: boolean;
    can_send_messages: boolean;
    can_send_media_messages: boolean;
    can_invite_users: boolean;
    can_pin_messages: boolean;
    can_send_polls: boolean;
    can_send_other_messages: boolean;
    can_add_web_page_previews: boolean;
}

export interface ChatMemberLeft {
    status: "left";
    user: User;
}

export interface ChatMemberBanned {
    status: "kicked";
    user: User;
    until_date: number;
}

export interface ChatMemberUpdated {
    chat: Chat;
    user: User;
    date: number;
    invite_link: ChatInviteLink;
    old_chat_member: ChatMember;
    new_chat_member: ChatMember;
}

export type ChatMember = ChatMemberAdministrator | ChatMemberOwner | ChatMemberMember | ChatMemberRestricted | ChatMemberLeft | ChatMemberBanned | ChatMemberUpdated;

export interface ChatPermissions {
    can_send_messages: boolean;
    can_send_media_messages: boolean;
    can_send_polls: boolean;
    can_send_other_messages: boolean;
    can_add_web_page_previews: boolean;
    can_change_info: boolean;
    can_invite_users: boolean;
    can_pin_messages: boolean;
}

export interface ChatLocation {
    location: Location;
    address: string;
}

export interface BotCommand {
    command: string;
    description: string;
}

export type BotCommandScope = 
    BotCommandScopeDefault |
    BotCommandScopeAllGroupChats |
    BotCommandScopeAllPrivateChats |
    BotCommandScopeAllChatAdministrators |
    BotCommandScopeChat |
    BotCommandScopeChatMember | 
    BotCommandScopeChatAdministrators;


export interface BotCommandScopeDefault {
    type: "default";
}

export interface BotCommandScopeAllPrivateChats {
    type: "all_private_chats";
}

export interface BotCommandScopeAllGroupChats {
    type: "all_group_chats";
}

export interface BotCommandScopeAllChatAdministrators {
    type: "all_chat_administrators";
}

export interface BotCommandScopeChat {
    type: "chat";
    chat_id: number | string;
}

export interface BotCommandScopeChatAdministrators {
    type: "chat_administrators";
    chat_id: number | string;
}

export interface BotCommandScopeChatMember {
    type: "chat_member";
    chat_id: number | string;
    user_id: number;
}

export interface ResposeParameters {
    migrate_to_chat_id?: number;
    retry_after?: number;
}

export interface InputFile {
    file_id?: string;
    url?: string;
}

export interface MessageId {
    message_id: number;
}

export type InputMedia = InputMediaPhoto | InputMediaVideo | InputMediaDocument | InputMediaAnimation;

export interface InputMediaPhoto {
    type: "photo";
    media: string;
    caption?: string;
    parse_mode?: ParseMode;
    caption_entities?: MessageEntity[];
}

export interface InputMediaAnimation {
    type: "animation";
    media: string;
    caption?: string;
    parse_mode?: ParseMode;
    caption_entities?: MessageEntity[];
    width?: number;
    height?: number;
    duration?: number;
    thumb?: InputFile | string;
}

export interface InputMediaVideo {
    type: "video";
    media: string;
    caption?: string;
    parse_mode?: ParseMode;
    caption_entities?: MessageEntity[];
    width?: number;
    height?: number;
    duration?: number;
    thumb?: InputFile | string;
    support_streaming?: boolean;
}

export interface InputMediaAudio {
    type: "audio";
    media: string;
    caption?: string;
    parse_mode?: ParseMode;
    caption_entities?: MessageEntity[];
    duration?: number;
    thumb?: InputFile | string;
    performer?: string;
    title?: string;
}

export interface InputMediaDocument {
    type: "document";
    media: string;
    caption?: string;
    parse_mode?: ParseMode;
    caption_entities?: MessageEntity[];
    thumb?: InputFile | string;
    disable_content_type_detection?: boolean;
}

export interface Message {
    message_id: number;
    from: User;
    date: number;
    chat: Chat;
    sender_chat: Chat;
    forward_from?: User;
    forward_from_chat?: Chat;
    forward_from_message_id?: number;
    forward_signature?: string;
    forward_date?: number;
    reply_to_message?: Message;
    edit_date?: number;
    media_group_id?: string;
    author_signature?: string;
    text?: string;
    entities?: MessageEntity[];
    caption_entities?: MessageEntity[];
    audio?: Audio;
    photo?: PhotoSize[];
    document?: Document;
    sticker?: Sticker;
    video?: Video;
    video_note?: VideoNote;
    voice?: Voice;
    caption?: string;
    contact?: Contact;
    location?: Location;
    dice?: Dice;
    game?: Game;
    venue?: Venue;
    left_chat_member?: User;
    new_chat_members?: User[];
    new_chat_title?: string;
    new_chat_photo?: PhotoSize[];
    proximity_alert_triggered?: ProximityAlertTriggered;
    connected_website?: string;
    pinned_message?: Message;
    successful_payment?: SuccessfulPayment;
    passport_data?: PassportData;
    migrate_to_chat_id?: number;
    migrate_from_chat_id?: number;
    group_chat_created?: boolean;
    supergroup_chat_created?: boolean;
    channel_chat_created?: boolean;
    delete_chat_photo?: boolean;
    poll?: Poll;
    message_auto_delete_timer_changed?: MessageAutoDeleteTimerChanged;
    via_bot?: User;
    reply_markup?: InlineKeyboardMarkup;
    voice_chat_scheduled?: VoiceChatScheduled;
    voice_chat_ended?: VoiceChatEnded;
    voice_chat_participants_invited?: VoiceChatParticipantsInvited;
    voice_chat_started: object; // no information
}

export interface MessageEntity {
    type: EntityType;
    offset: number;
    length: number;
    url?: string;
    user?: User;
    language?: string;
}

export interface User {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_bot: boolean;
}

export type ParseMode = "Markdown" | "HTML" | "MarkdownV2";
export type EntityType = "mention" | "url" | "email" | "text_mention" | "pre" | "bold" | "italic" | "code" | "text_link" | "phone_number" | "hashtag" | "cashtag" | "bot_command" | "strikethrough" | "underline";
export type ChatType = "private" | "group" | "supergroup" | "channel";
export type Point = "forehead" | "eyes" | "mouth" | "chin";
export type GooglePlaceTypes = "accounting" | "airport" | "amusement_park" | "aquarium" | "art_gallery" | "atm" | "bakery" | "bank" | "bar" | "beauty_salon" | "bicycle_store" | "book_store" | "bowling_alley" | "bus_station" | "cafe" | "campground" | "car_dealer" | "car_rental" | "car_repair" | "car_wash" | "casino" | "cemetery" | "church" | "city_hall" | "clothing_store" | "convenience_store" | "courthouse" | "dentist" | "department_store" | "doctor" | "drugstore" | "electrician" | "electronics_store" | "embassy" | "fire_station" | "florist" | "funeral_home" | "furniture_store" | "gas_station" | "gym" | "hair_care" | "hardware_store" | "hindu_temple" | "home_goods_store" | "hospital" | "insurance_agency" | "jewelry_store" | "laundry" | "lawyer" | "library" | "light_rail_station" | "liquor_store" | "local_government_office" | "locksmith" | "lodging" | "meal_delivery" | "meal_takeaway" | "mosque" | "movie_rental" | "movie_theater" | "moving_company" | "museum" | "night_club" | "painter" | "park" | "parking" | "pet_store" | "pharmacy" | "physiotherapist" | "plumber" | "police" | "post_office" | "primary_school" | "real_estate_agency" | "restaurant" | "roofing_contractor" | "rv_park" | "school" | "secondary_school" | "shoe_store" | "shopping_mall" | "spa" | "stadium" | "storage" | "store" | "subway_station" | "supermarket" | "synagogue" | "taxi_stand" | "tourist_attraction" | "train_station" | "transit_station" | "travel_agency" | "university" | "veterinary_care" | "zoo" | "administrative_area_level_1" | "administrative_area_level_2" | "administrative_area_level_3" | "administrative_area_level_4" | "administrative_area_level_5" | "archipelago" | "colloquial_area" | "continent" | "country" | "establishment" | "finance" | "floor" | "food" | "general_contractor" | "geocode" | "health" | "intersection" | "landmark" | "locality" | "natural_feature" | "neighborhood" | "place_of_worship" | "plus_code" | "point_of_interest" | "political" | "post_box" | "postal_code" | "postal_code_prefix" | "postal_code_suffix" | "postal_town" | "premise" | "room" | "route" | "street_address" | "street_number" | "sublocality" | "sublocality_level_1" | "sublocality_level_2" | "sublocality_level_3" | "sublocality_level_4" | "sublocality_level_5" | "subpremise" | "town_square";
export type SupportedCurrencies = "AED" | "AFN" | "ALL" | "AMD" | "ARS" | "AUD" | "AZN" | "BAM" | "BDT" | "BGN" | "BND" | "BOB" | "BRL" | "CAD" | "CHF" | "CLP" | "CNY" | "COP" | "CRC" | "CZK" | "DKK" | "DOP" | "DZD" | "EGP" | "EUR" | "GBP" | "GEL" | "GTQ" | "HKD" | "HNL" | "HRK" | "HUF" | "IDR" | "ILS" | "INR" | "ISK" | "JMD" | "JPY" | "KES" | "KGS" | "KRW" | "KZT" | "LBP" | "LKR" | "MAD" | "MDL" | "MNT" | "MUR" | "MVR" | "MXN" | "MYR" | "MZN" | "NGN" | "NIO" | "NOK" | "NPR" | "NZD" | "PAB" | "PEN" | "PHP" | "PKR" | "PLN" | "PYG" | "QAR" | "RON" | "RSD" | "RUB" | "SAR" | "SEK" | "SGD" | "THB" | "TJS" | "TRY" | "TTD" | "TWD" | "TZS" | "UAH" | "UGX" | "USD" | "UYU" | "UZS" | "VND" | "YER" | "ZAR";
export type EncryptedPassportElementType = "personal_details" | "passport" | "driver_license" | "identity_card" | "internal_passport" | "address" | "utility_bill" | "bank_statement" | "rental_agreement" | "passport_registration" | "temporary_registration" | "email" | "phone_number";
export type PollType = "regular" | "quiz";
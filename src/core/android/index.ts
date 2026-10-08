/**
 * Зеркало сетевого слоя Android.
 *
 *   import { NodeRetrofitClient, type M } from '@/core/android';
 *   const r = await NodeRetrofitClient.groupApi.getGroups(50);   // как в Kotlin
 *   if (r.apiStatus === 200) …                                    // поля как в Kotlin
 *
 * Код в gen/ создаёт scripts/gen-android-api.mjs из исходников Android.
 */
import './adapters';

export * from './gen/apis';
export type * as M from './gen/models';
export * as Models from './gen/models';
export { HttpException, type RetrofitResponse, type MultipartPart, type RawResponseBody } from './retrofit';
export { newModel, decodeModel, encodeModel } from './gson';
export { Constants } from './gen/Constants';
export * from './computed';


/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Center
 * 
 */
export type Center = $Result.DefaultSelection<Prisma.$CenterPayload>
/**
 * Model Claim
 * 
 */
export type Claim = $Result.DefaultSelection<Prisma.$ClaimPayload>
/**
 * Model Department
 * 
 */
export type Department = $Result.DefaultSelection<Prisma.$DepartmentPayload>
/**
 * Model SupervisedStudent
 * 
 */
export type SupervisedStudent = $Result.DefaultSelection<Prisma.$SupervisedStudentPayload>
/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const Claim_claimType: {
  TEACHING: 'TEACHING',
  TRANSPORTATION: 'TRANSPORTATION',
  THESIS_PROJECT: 'THESIS_PROJECT'
};

export type Claim_claimType = (typeof Claim_claimType)[keyof typeof Claim_claimType]


export const Claim_status: {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

export type Claim_status = (typeof Claim_status)[keyof typeof Claim_status]


export const User_role: {
  REGISTRY: 'REGISTRY',
  COORDINATOR: 'COORDINATOR',
  LECTURER: 'LECTURER'
};

export type User_role = (typeof User_role)[keyof typeof User_role]


export const Claim_transportType: {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE'
};

export type Claim_transportType = (typeof Claim_transportType)[keyof typeof Claim_transportType]


export const Claim_thesisType: {
  SUPERVISION: 'SUPERVISION',
  EXAMINATION: 'EXAMINATION'
};

export type Claim_thesisType = (typeof Claim_thesisType)[keyof typeof Claim_thesisType]


export const Claim_thesisSupervisionRank: {
  PHD: 'PHD',
  MPHIL: 'MPHIL',
  MA: 'MA',
  MSC: 'MSC',
  BED: 'BED',
  BSC: 'BSC',
  BA: 'BA',
  ED: 'ED'
};

export type Claim_thesisSupervisionRank = (typeof Claim_thesisSupervisionRank)[keyof typeof Claim_thesisSupervisionRank]

}

export type Claim_claimType = $Enums.Claim_claimType

export const Claim_claimType: typeof $Enums.Claim_claimType

export type Claim_status = $Enums.Claim_status

export const Claim_status: typeof $Enums.Claim_status

export type User_role = $Enums.User_role

export const User_role: typeof $Enums.User_role

export type Claim_transportType = $Enums.Claim_transportType

export const Claim_transportType: typeof $Enums.Claim_transportType

export type Claim_thesisType = $Enums.Claim_thesisType

export const Claim_thesisType: typeof $Enums.Claim_thesisType

export type Claim_thesisSupervisionRank = $Enums.Claim_thesisSupervisionRank

export const Claim_thesisSupervisionRank: typeof $Enums.Claim_thesisSupervisionRank

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Centers
 * const centers = await prisma.center.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Centers
   * const centers = await prisma.center.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.center`: Exposes CRUD operations for the **Center** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Centers
    * const centers = await prisma.center.findMany()
    * ```
    */
  get center(): Prisma.CenterDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.claim`: Exposes CRUD operations for the **Claim** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Claims
    * const claims = await prisma.claim.findMany()
    * ```
    */
  get claim(): Prisma.ClaimDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.department`: Exposes CRUD operations for the **Department** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Departments
    * const departments = await prisma.department.findMany()
    * ```
    */
  get department(): Prisma.DepartmentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.supervisedStudent`: Exposes CRUD operations for the **SupervisedStudent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SupervisedStudents
    * const supervisedStudents = await prisma.supervisedStudent.findMany()
    * ```
    */
  get supervisedStudent(): Prisma.SupervisedStudentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.7.0
   * Query Engine version: 3cff47a7f5d65c3ea74883f1d736e41d68ce91ed
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Center: 'Center',
    Claim: 'Claim',
    Department: 'Department',
    SupervisedStudent: 'SupervisedStudent',
    User: 'User'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "center" | "claim" | "department" | "supervisedStudent" | "user"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Center: {
        payload: Prisma.$CenterPayload<ExtArgs>
        fields: Prisma.CenterFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CenterFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CenterPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CenterFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CenterPayload>
          }
          findFirst: {
            args: Prisma.CenterFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CenterPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CenterFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CenterPayload>
          }
          findMany: {
            args: Prisma.CenterFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CenterPayload>[]
          }
          create: {
            args: Prisma.CenterCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CenterPayload>
          }
          createMany: {
            args: Prisma.CenterCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.CenterDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CenterPayload>
          }
          update: {
            args: Prisma.CenterUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CenterPayload>
          }
          deleteMany: {
            args: Prisma.CenterDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CenterUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CenterUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CenterPayload>
          }
          aggregate: {
            args: Prisma.CenterAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCenter>
          }
          groupBy: {
            args: Prisma.CenterGroupByArgs<ExtArgs>
            result: $Utils.Optional<CenterGroupByOutputType>[]
          }
          count: {
            args: Prisma.CenterCountArgs<ExtArgs>
            result: $Utils.Optional<CenterCountAggregateOutputType> | number
          }
        }
      }
      Claim: {
        payload: Prisma.$ClaimPayload<ExtArgs>
        fields: Prisma.ClaimFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ClaimFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClaimPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ClaimFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClaimPayload>
          }
          findFirst: {
            args: Prisma.ClaimFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClaimPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ClaimFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClaimPayload>
          }
          findMany: {
            args: Prisma.ClaimFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClaimPayload>[]
          }
          create: {
            args: Prisma.ClaimCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClaimPayload>
          }
          createMany: {
            args: Prisma.ClaimCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ClaimDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClaimPayload>
          }
          update: {
            args: Prisma.ClaimUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClaimPayload>
          }
          deleteMany: {
            args: Prisma.ClaimDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ClaimUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ClaimUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClaimPayload>
          }
          aggregate: {
            args: Prisma.ClaimAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateClaim>
          }
          groupBy: {
            args: Prisma.ClaimGroupByArgs<ExtArgs>
            result: $Utils.Optional<ClaimGroupByOutputType>[]
          }
          count: {
            args: Prisma.ClaimCountArgs<ExtArgs>
            result: $Utils.Optional<ClaimCountAggregateOutputType> | number
          }
        }
      }
      Department: {
        payload: Prisma.$DepartmentPayload<ExtArgs>
        fields: Prisma.DepartmentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DepartmentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DepartmentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>
          }
          findFirst: {
            args: Prisma.DepartmentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DepartmentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>
          }
          findMany: {
            args: Prisma.DepartmentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>[]
          }
          create: {
            args: Prisma.DepartmentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>
          }
          createMany: {
            args: Prisma.DepartmentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.DepartmentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>
          }
          update: {
            args: Prisma.DepartmentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>
          }
          deleteMany: {
            args: Prisma.DepartmentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DepartmentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.DepartmentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DepartmentPayload>
          }
          aggregate: {
            args: Prisma.DepartmentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDepartment>
          }
          groupBy: {
            args: Prisma.DepartmentGroupByArgs<ExtArgs>
            result: $Utils.Optional<DepartmentGroupByOutputType>[]
          }
          count: {
            args: Prisma.DepartmentCountArgs<ExtArgs>
            result: $Utils.Optional<DepartmentCountAggregateOutputType> | number
          }
        }
      }
      SupervisedStudent: {
        payload: Prisma.$SupervisedStudentPayload<ExtArgs>
        fields: Prisma.SupervisedStudentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SupervisedStudentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SupervisedStudentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SupervisedStudentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SupervisedStudentPayload>
          }
          findFirst: {
            args: Prisma.SupervisedStudentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SupervisedStudentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SupervisedStudentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SupervisedStudentPayload>
          }
          findMany: {
            args: Prisma.SupervisedStudentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SupervisedStudentPayload>[]
          }
          create: {
            args: Prisma.SupervisedStudentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SupervisedStudentPayload>
          }
          createMany: {
            args: Prisma.SupervisedStudentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.SupervisedStudentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SupervisedStudentPayload>
          }
          update: {
            args: Prisma.SupervisedStudentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SupervisedStudentPayload>
          }
          deleteMany: {
            args: Prisma.SupervisedStudentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SupervisedStudentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.SupervisedStudentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SupervisedStudentPayload>
          }
          aggregate: {
            args: Prisma.SupervisedStudentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSupervisedStudent>
          }
          groupBy: {
            args: Prisma.SupervisedStudentGroupByArgs<ExtArgs>
            result: $Utils.Optional<SupervisedStudentGroupByOutputType>[]
          }
          count: {
            args: Prisma.SupervisedStudentCountArgs<ExtArgs>
            result: $Utils.Optional<SupervisedStudentCountAggregateOutputType> | number
          }
        }
      }
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    center?: CenterOmit
    claim?: ClaimOmit
    department?: DepartmentOmit
    supervisedStudent?: SupervisedStudentOmit
    user?: UserOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type CenterCountOutputType
   */

  export type CenterCountOutputType = {
    Claim: number
    Department: number
    User_User_lecturerCenterIdToCenter: number
  }

  export type CenterCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    Claim?: boolean | CenterCountOutputTypeCountClaimArgs
    Department?: boolean | CenterCountOutputTypeCountDepartmentArgs
    User_User_lecturerCenterIdToCenter?: boolean | CenterCountOutputTypeCountUser_User_lecturerCenterIdToCenterArgs
  }

  // Custom InputTypes
  /**
   * CenterCountOutputType without action
   */
  export type CenterCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CenterCountOutputType
     */
    select?: CenterCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CenterCountOutputType without action
   */
  export type CenterCountOutputTypeCountClaimArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ClaimWhereInput
  }

  /**
   * CenterCountOutputType without action
   */
  export type CenterCountOutputTypeCountDepartmentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DepartmentWhereInput
  }

  /**
   * CenterCountOutputType without action
   */
  export type CenterCountOutputTypeCountUser_User_lecturerCenterIdToCenterArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
  }


  /**
   * Count Type ClaimCountOutputType
   */

  export type ClaimCountOutputType = {
    SupervisedStudent: number
  }

  export type ClaimCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    SupervisedStudent?: boolean | ClaimCountOutputTypeCountSupervisedStudentArgs
  }

  // Custom InputTypes
  /**
   * ClaimCountOutputType without action
   */
  export type ClaimCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClaimCountOutputType
     */
    select?: ClaimCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ClaimCountOutputType without action
   */
  export type ClaimCountOutputTypeCountSupervisedStudentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SupervisedStudentWhereInput
  }


  /**
   * Count Type DepartmentCountOutputType
   */

  export type DepartmentCountOutputType = {
    User: number
  }

  export type DepartmentCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    User?: boolean | DepartmentCountOutputTypeCountUserArgs
  }

  // Custom InputTypes
  /**
   * DepartmentCountOutputType without action
   */
  export type DepartmentCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DepartmentCountOutputType
     */
    select?: DepartmentCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * DepartmentCountOutputType without action
   */
  export type DepartmentCountOutputTypeCountUserArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
  }


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    Claim_Claim_processedByIdToUser: number
    Claim_Claim_submittedByIdToUser: number
    SupervisedStudent: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    Claim_Claim_processedByIdToUser?: boolean | UserCountOutputTypeCountClaim_Claim_processedByIdToUserArgs
    Claim_Claim_submittedByIdToUser?: boolean | UserCountOutputTypeCountClaim_Claim_submittedByIdToUserArgs
    SupervisedStudent?: boolean | UserCountOutputTypeCountSupervisedStudentArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountClaim_Claim_processedByIdToUserArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ClaimWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountClaim_Claim_submittedByIdToUserArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ClaimWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountSupervisedStudentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SupervisedStudentWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Center
   */

  export type AggregateCenter = {
    _count: CenterCountAggregateOutputType | null
    _min: CenterMinAggregateOutputType | null
    _max: CenterMaxAggregateOutputType | null
  }

  export type CenterMinAggregateOutputType = {
    id: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
    coordinatorId: string | null
  }

  export type CenterMaxAggregateOutputType = {
    id: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
    coordinatorId: string | null
  }

  export type CenterCountAggregateOutputType = {
    id: number
    name: number
    createdAt: number
    updatedAt: number
    coordinatorId: number
    _all: number
  }


  export type CenterMinAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
    coordinatorId?: true
  }

  export type CenterMaxAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
    coordinatorId?: true
  }

  export type CenterCountAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
    coordinatorId?: true
    _all?: true
  }

  export type CenterAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Center to aggregate.
     */
    where?: CenterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Centers to fetch.
     */
    orderBy?: CenterOrderByWithRelationInput | CenterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CenterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Centers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Centers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Centers
    **/
    _count?: true | CenterCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CenterMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CenterMaxAggregateInputType
  }

  export type GetCenterAggregateType<T extends CenterAggregateArgs> = {
        [P in keyof T & keyof AggregateCenter]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCenter[P]>
      : GetScalarType<T[P], AggregateCenter[P]>
  }




  export type CenterGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CenterWhereInput
    orderBy?: CenterOrderByWithAggregationInput | CenterOrderByWithAggregationInput[]
    by: CenterScalarFieldEnum[] | CenterScalarFieldEnum
    having?: CenterScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CenterCountAggregateInputType | true
    _min?: CenterMinAggregateInputType
    _max?: CenterMaxAggregateInputType
  }

  export type CenterGroupByOutputType = {
    id: string
    name: string
    createdAt: Date
    updatedAt: Date
    coordinatorId: string
    _count: CenterCountAggregateOutputType | null
    _min: CenterMinAggregateOutputType | null
    _max: CenterMaxAggregateOutputType | null
  }

  type GetCenterGroupByPayload<T extends CenterGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CenterGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CenterGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CenterGroupByOutputType[P]>
            : GetScalarType<T[P], CenterGroupByOutputType[P]>
        }
      >
    >


  export type CenterSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    coordinatorId?: boolean
    User_Center_coordinatorIdToUser?: boolean | UserDefaultArgs<ExtArgs>
    Claim?: boolean | Center$ClaimArgs<ExtArgs>
    Department?: boolean | Center$DepartmentArgs<ExtArgs>
    User_User_lecturerCenterIdToCenter?: boolean | Center$User_User_lecturerCenterIdToCenterArgs<ExtArgs>
    _count?: boolean | CenterCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["center"]>



  export type CenterSelectScalar = {
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    coordinatorId?: boolean
  }

  export type CenterOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "createdAt" | "updatedAt" | "coordinatorId", ExtArgs["result"]["center"]>
  export type CenterInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    User_Center_coordinatorIdToUser?: boolean | UserDefaultArgs<ExtArgs>
    Claim?: boolean | Center$ClaimArgs<ExtArgs>
    Department?: boolean | Center$DepartmentArgs<ExtArgs>
    User_User_lecturerCenterIdToCenter?: boolean | Center$User_User_lecturerCenterIdToCenterArgs<ExtArgs>
    _count?: boolean | CenterCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $CenterPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Center"
    objects: {
      User_Center_coordinatorIdToUser: Prisma.$UserPayload<ExtArgs>
      Claim: Prisma.$ClaimPayload<ExtArgs>[]
      Department: Prisma.$DepartmentPayload<ExtArgs>[]
      User_User_lecturerCenterIdToCenter: Prisma.$UserPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      createdAt: Date
      updatedAt: Date
      coordinatorId: string
    }, ExtArgs["result"]["center"]>
    composites: {}
  }

  type CenterGetPayload<S extends boolean | null | undefined | CenterDefaultArgs> = $Result.GetResult<Prisma.$CenterPayload, S>

  type CenterCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CenterFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CenterCountAggregateInputType | true
    }

  export interface CenterDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Center'], meta: { name: 'Center' } }
    /**
     * Find zero or one Center that matches the filter.
     * @param {CenterFindUniqueArgs} args - Arguments to find a Center
     * @example
     * // Get one Center
     * const center = await prisma.center.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CenterFindUniqueArgs>(args: SelectSubset<T, CenterFindUniqueArgs<ExtArgs>>): Prisma__CenterClient<$Result.GetResult<Prisma.$CenterPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Center that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CenterFindUniqueOrThrowArgs} args - Arguments to find a Center
     * @example
     * // Get one Center
     * const center = await prisma.center.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CenterFindUniqueOrThrowArgs>(args: SelectSubset<T, CenterFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CenterClient<$Result.GetResult<Prisma.$CenterPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Center that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CenterFindFirstArgs} args - Arguments to find a Center
     * @example
     * // Get one Center
     * const center = await prisma.center.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CenterFindFirstArgs>(args?: SelectSubset<T, CenterFindFirstArgs<ExtArgs>>): Prisma__CenterClient<$Result.GetResult<Prisma.$CenterPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Center that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CenterFindFirstOrThrowArgs} args - Arguments to find a Center
     * @example
     * // Get one Center
     * const center = await prisma.center.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CenterFindFirstOrThrowArgs>(args?: SelectSubset<T, CenterFindFirstOrThrowArgs<ExtArgs>>): Prisma__CenterClient<$Result.GetResult<Prisma.$CenterPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Centers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CenterFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Centers
     * const centers = await prisma.center.findMany()
     * 
     * // Get first 10 Centers
     * const centers = await prisma.center.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const centerWithIdOnly = await prisma.center.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CenterFindManyArgs>(args?: SelectSubset<T, CenterFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CenterPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Center.
     * @param {CenterCreateArgs} args - Arguments to create a Center.
     * @example
     * // Create one Center
     * const Center = await prisma.center.create({
     *   data: {
     *     // ... data to create a Center
     *   }
     * })
     * 
     */
    create<T extends CenterCreateArgs>(args: SelectSubset<T, CenterCreateArgs<ExtArgs>>): Prisma__CenterClient<$Result.GetResult<Prisma.$CenterPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Centers.
     * @param {CenterCreateManyArgs} args - Arguments to create many Centers.
     * @example
     * // Create many Centers
     * const center = await prisma.center.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CenterCreateManyArgs>(args?: SelectSubset<T, CenterCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Center.
     * @param {CenterDeleteArgs} args - Arguments to delete one Center.
     * @example
     * // Delete one Center
     * const Center = await prisma.center.delete({
     *   where: {
     *     // ... filter to delete one Center
     *   }
     * })
     * 
     */
    delete<T extends CenterDeleteArgs>(args: SelectSubset<T, CenterDeleteArgs<ExtArgs>>): Prisma__CenterClient<$Result.GetResult<Prisma.$CenterPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Center.
     * @param {CenterUpdateArgs} args - Arguments to update one Center.
     * @example
     * // Update one Center
     * const center = await prisma.center.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CenterUpdateArgs>(args: SelectSubset<T, CenterUpdateArgs<ExtArgs>>): Prisma__CenterClient<$Result.GetResult<Prisma.$CenterPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Centers.
     * @param {CenterDeleteManyArgs} args - Arguments to filter Centers to delete.
     * @example
     * // Delete a few Centers
     * const { count } = await prisma.center.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CenterDeleteManyArgs>(args?: SelectSubset<T, CenterDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Centers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CenterUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Centers
     * const center = await prisma.center.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CenterUpdateManyArgs>(args: SelectSubset<T, CenterUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Center.
     * @param {CenterUpsertArgs} args - Arguments to update or create a Center.
     * @example
     * // Update or create a Center
     * const center = await prisma.center.upsert({
     *   create: {
     *     // ... data to create a Center
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Center we want to update
     *   }
     * })
     */
    upsert<T extends CenterUpsertArgs>(args: SelectSubset<T, CenterUpsertArgs<ExtArgs>>): Prisma__CenterClient<$Result.GetResult<Prisma.$CenterPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Centers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CenterCountArgs} args - Arguments to filter Centers to count.
     * @example
     * // Count the number of Centers
     * const count = await prisma.center.count({
     *   where: {
     *     // ... the filter for the Centers we want to count
     *   }
     * })
    **/
    count<T extends CenterCountArgs>(
      args?: Subset<T, CenterCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CenterCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Center.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CenterAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CenterAggregateArgs>(args: Subset<T, CenterAggregateArgs>): Prisma.PrismaPromise<GetCenterAggregateType<T>>

    /**
     * Group by Center.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CenterGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CenterGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CenterGroupByArgs['orderBy'] }
        : { orderBy?: CenterGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CenterGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCenterGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Center model
   */
  readonly fields: CenterFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Center.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CenterClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    User_Center_coordinatorIdToUser<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    Claim<T extends Center$ClaimArgs<ExtArgs> = {}>(args?: Subset<T, Center$ClaimArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClaimPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    Department<T extends Center$DepartmentArgs<ExtArgs> = {}>(args?: Subset<T, Center$DepartmentArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    User_User_lecturerCenterIdToCenter<T extends Center$User_User_lecturerCenterIdToCenterArgs<ExtArgs> = {}>(args?: Subset<T, Center$User_User_lecturerCenterIdToCenterArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Center model
   */
  interface CenterFieldRefs {
    readonly id: FieldRef<"Center", 'String'>
    readonly name: FieldRef<"Center", 'String'>
    readonly createdAt: FieldRef<"Center", 'DateTime'>
    readonly updatedAt: FieldRef<"Center", 'DateTime'>
    readonly coordinatorId: FieldRef<"Center", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Center findUnique
   */
  export type CenterFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Center
     */
    select?: CenterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Center
     */
    omit?: CenterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CenterInclude<ExtArgs> | null
    /**
     * Filter, which Center to fetch.
     */
    where: CenterWhereUniqueInput
  }

  /**
   * Center findUniqueOrThrow
   */
  export type CenterFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Center
     */
    select?: CenterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Center
     */
    omit?: CenterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CenterInclude<ExtArgs> | null
    /**
     * Filter, which Center to fetch.
     */
    where: CenterWhereUniqueInput
  }

  /**
   * Center findFirst
   */
  export type CenterFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Center
     */
    select?: CenterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Center
     */
    omit?: CenterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CenterInclude<ExtArgs> | null
    /**
     * Filter, which Center to fetch.
     */
    where?: CenterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Centers to fetch.
     */
    orderBy?: CenterOrderByWithRelationInput | CenterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Centers.
     */
    cursor?: CenterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Centers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Centers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Centers.
     */
    distinct?: CenterScalarFieldEnum | CenterScalarFieldEnum[]
  }

  /**
   * Center findFirstOrThrow
   */
  export type CenterFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Center
     */
    select?: CenterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Center
     */
    omit?: CenterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CenterInclude<ExtArgs> | null
    /**
     * Filter, which Center to fetch.
     */
    where?: CenterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Centers to fetch.
     */
    orderBy?: CenterOrderByWithRelationInput | CenterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Centers.
     */
    cursor?: CenterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Centers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Centers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Centers.
     */
    distinct?: CenterScalarFieldEnum | CenterScalarFieldEnum[]
  }

  /**
   * Center findMany
   */
  export type CenterFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Center
     */
    select?: CenterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Center
     */
    omit?: CenterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CenterInclude<ExtArgs> | null
    /**
     * Filter, which Centers to fetch.
     */
    where?: CenterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Centers to fetch.
     */
    orderBy?: CenterOrderByWithRelationInput | CenterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Centers.
     */
    cursor?: CenterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Centers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Centers.
     */
    skip?: number
    distinct?: CenterScalarFieldEnum | CenterScalarFieldEnum[]
  }

  /**
   * Center create
   */
  export type CenterCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Center
     */
    select?: CenterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Center
     */
    omit?: CenterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CenterInclude<ExtArgs> | null
    /**
     * The data needed to create a Center.
     */
    data: XOR<CenterCreateInput, CenterUncheckedCreateInput>
  }

  /**
   * Center createMany
   */
  export type CenterCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Centers.
     */
    data: CenterCreateManyInput | CenterCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Center update
   */
  export type CenterUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Center
     */
    select?: CenterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Center
     */
    omit?: CenterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CenterInclude<ExtArgs> | null
    /**
     * The data needed to update a Center.
     */
    data: XOR<CenterUpdateInput, CenterUncheckedUpdateInput>
    /**
     * Choose, which Center to update.
     */
    where: CenterWhereUniqueInput
  }

  /**
   * Center updateMany
   */
  export type CenterUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Centers.
     */
    data: XOR<CenterUpdateManyMutationInput, CenterUncheckedUpdateManyInput>
    /**
     * Filter which Centers to update
     */
    where?: CenterWhereInput
    /**
     * Limit how many Centers to update.
     */
    limit?: number
  }

  /**
   * Center upsert
   */
  export type CenterUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Center
     */
    select?: CenterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Center
     */
    omit?: CenterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CenterInclude<ExtArgs> | null
    /**
     * The filter to search for the Center to update in case it exists.
     */
    where: CenterWhereUniqueInput
    /**
     * In case the Center found by the `where` argument doesn't exist, create a new Center with this data.
     */
    create: XOR<CenterCreateInput, CenterUncheckedCreateInput>
    /**
     * In case the Center was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CenterUpdateInput, CenterUncheckedUpdateInput>
  }

  /**
   * Center delete
   */
  export type CenterDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Center
     */
    select?: CenterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Center
     */
    omit?: CenterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CenterInclude<ExtArgs> | null
    /**
     * Filter which Center to delete.
     */
    where: CenterWhereUniqueInput
  }

  /**
   * Center deleteMany
   */
  export type CenterDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Centers to delete
     */
    where?: CenterWhereInput
    /**
     * Limit how many Centers to delete.
     */
    limit?: number
  }

  /**
   * Center.Claim
   */
  export type Center$ClaimArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Claim
     */
    select?: ClaimSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Claim
     */
    omit?: ClaimOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClaimInclude<ExtArgs> | null
    where?: ClaimWhereInput
    orderBy?: ClaimOrderByWithRelationInput | ClaimOrderByWithRelationInput[]
    cursor?: ClaimWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ClaimScalarFieldEnum | ClaimScalarFieldEnum[]
  }

  /**
   * Center.Department
   */
  export type Center$DepartmentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Department
     */
    omit?: DepartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    where?: DepartmentWhereInput
    orderBy?: DepartmentOrderByWithRelationInput | DepartmentOrderByWithRelationInput[]
    cursor?: DepartmentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DepartmentScalarFieldEnum | DepartmentScalarFieldEnum[]
  }

  /**
   * Center.User_User_lecturerCenterIdToCenter
   */
  export type Center$User_User_lecturerCenterIdToCenterArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    cursor?: UserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * Center without action
   */
  export type CenterDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Center
     */
    select?: CenterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Center
     */
    omit?: CenterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CenterInclude<ExtArgs> | null
  }


  /**
   * Model Claim
   */

  export type AggregateClaim = {
    _count: ClaimCountAggregateOutputType | null
    _avg: ClaimAvgAggregateOutputType | null
    _sum: ClaimSumAggregateOutputType | null
    _min: ClaimMinAggregateOutputType | null
    _max: ClaimMaxAggregateOutputType | null
  }

  export type ClaimAvgAggregateOutputType = {
    teachingHours: number | null
    transportCubicCapacity: number | null
    transportAmount: number | null
  }

  export type ClaimSumAggregateOutputType = {
    teachingHours: number | null
    transportCubicCapacity: number | null
    transportAmount: number | null
  }

  export type ClaimMinAggregateOutputType = {
    id: string | null
    claimType: $Enums.Claim_claimType | null
    status: $Enums.Claim_status | null
    submittedAt: Date | null
    updatedAt: Date | null
    processedAt: Date | null
    submittedById: string | null
    centerId: string | null
    processedById: string | null
    teachingDate: Date | null
    teachingStartTime: string | null
    teachingEndTime: string | null
    teachingHours: number | null
    transportType: $Enums.Claim_transportType | null
    transportDestinationTo: string | null
    transportDestinationFrom: string | null
    transportRegNumber: string | null
    transportCubicCapacity: number | null
    transportAmount: number | null
    thesisType: $Enums.Claim_thesisType | null
    thesisSupervisionRank: $Enums.Claim_thesisSupervisionRank | null
    thesisExamCourseCode: string | null
    thesisExamDate: Date | null
  }

  export type ClaimMaxAggregateOutputType = {
    id: string | null
    claimType: $Enums.Claim_claimType | null
    status: $Enums.Claim_status | null
    submittedAt: Date | null
    updatedAt: Date | null
    processedAt: Date | null
    submittedById: string | null
    centerId: string | null
    processedById: string | null
    teachingDate: Date | null
    teachingStartTime: string | null
    teachingEndTime: string | null
    teachingHours: number | null
    transportType: $Enums.Claim_transportType | null
    transportDestinationTo: string | null
    transportDestinationFrom: string | null
    transportRegNumber: string | null
    transportCubicCapacity: number | null
    transportAmount: number | null
    thesisType: $Enums.Claim_thesisType | null
    thesisSupervisionRank: $Enums.Claim_thesisSupervisionRank | null
    thesisExamCourseCode: string | null
    thesisExamDate: Date | null
  }

  export type ClaimCountAggregateOutputType = {
    id: number
    claimType: number
    status: number
    submittedAt: number
    updatedAt: number
    processedAt: number
    submittedById: number
    centerId: number
    processedById: number
    teachingDate: number
    teachingStartTime: number
    teachingEndTime: number
    teachingHours: number
    transportType: number
    transportDestinationTo: number
    transportDestinationFrom: number
    transportRegNumber: number
    transportCubicCapacity: number
    transportAmount: number
    thesisType: number
    thesisSupervisionRank: number
    thesisExamCourseCode: number
    thesisExamDate: number
    _all: number
  }


  export type ClaimAvgAggregateInputType = {
    teachingHours?: true
    transportCubicCapacity?: true
    transportAmount?: true
  }

  export type ClaimSumAggregateInputType = {
    teachingHours?: true
    transportCubicCapacity?: true
    transportAmount?: true
  }

  export type ClaimMinAggregateInputType = {
    id?: true
    claimType?: true
    status?: true
    submittedAt?: true
    updatedAt?: true
    processedAt?: true
    submittedById?: true
    centerId?: true
    processedById?: true
    teachingDate?: true
    teachingStartTime?: true
    teachingEndTime?: true
    teachingHours?: true
    transportType?: true
    transportDestinationTo?: true
    transportDestinationFrom?: true
    transportRegNumber?: true
    transportCubicCapacity?: true
    transportAmount?: true
    thesisType?: true
    thesisSupervisionRank?: true
    thesisExamCourseCode?: true
    thesisExamDate?: true
  }

  export type ClaimMaxAggregateInputType = {
    id?: true
    claimType?: true
    status?: true
    submittedAt?: true
    updatedAt?: true
    processedAt?: true
    submittedById?: true
    centerId?: true
    processedById?: true
    teachingDate?: true
    teachingStartTime?: true
    teachingEndTime?: true
    teachingHours?: true
    transportType?: true
    transportDestinationTo?: true
    transportDestinationFrom?: true
    transportRegNumber?: true
    transportCubicCapacity?: true
    transportAmount?: true
    thesisType?: true
    thesisSupervisionRank?: true
    thesisExamCourseCode?: true
    thesisExamDate?: true
  }

  export type ClaimCountAggregateInputType = {
    id?: true
    claimType?: true
    status?: true
    submittedAt?: true
    updatedAt?: true
    processedAt?: true
    submittedById?: true
    centerId?: true
    processedById?: true
    teachingDate?: true
    teachingStartTime?: true
    teachingEndTime?: true
    teachingHours?: true
    transportType?: true
    transportDestinationTo?: true
    transportDestinationFrom?: true
    transportRegNumber?: true
    transportCubicCapacity?: true
    transportAmount?: true
    thesisType?: true
    thesisSupervisionRank?: true
    thesisExamCourseCode?: true
    thesisExamDate?: true
    _all?: true
  }

  export type ClaimAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Claim to aggregate.
     */
    where?: ClaimWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Claims to fetch.
     */
    orderBy?: ClaimOrderByWithRelationInput | ClaimOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ClaimWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Claims from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Claims.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Claims
    **/
    _count?: true | ClaimCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ClaimAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ClaimSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ClaimMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ClaimMaxAggregateInputType
  }

  export type GetClaimAggregateType<T extends ClaimAggregateArgs> = {
        [P in keyof T & keyof AggregateClaim]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateClaim[P]>
      : GetScalarType<T[P], AggregateClaim[P]>
  }




  export type ClaimGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ClaimWhereInput
    orderBy?: ClaimOrderByWithAggregationInput | ClaimOrderByWithAggregationInput[]
    by: ClaimScalarFieldEnum[] | ClaimScalarFieldEnum
    having?: ClaimScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ClaimCountAggregateInputType | true
    _avg?: ClaimAvgAggregateInputType
    _sum?: ClaimSumAggregateInputType
    _min?: ClaimMinAggregateInputType
    _max?: ClaimMaxAggregateInputType
  }

  export type ClaimGroupByOutputType = {
    id: string
    claimType: $Enums.Claim_claimType
    status: $Enums.Claim_status
    submittedAt: Date
    updatedAt: Date
    processedAt: Date | null
    submittedById: string
    centerId: string
    processedById: string | null
    teachingDate: Date | null
    teachingStartTime: string | null
    teachingEndTime: string | null
    teachingHours: number | null
    transportType: $Enums.Claim_transportType | null
    transportDestinationTo: string | null
    transportDestinationFrom: string | null
    transportRegNumber: string | null
    transportCubicCapacity: number | null
    transportAmount: number | null
    thesisType: $Enums.Claim_thesisType | null
    thesisSupervisionRank: $Enums.Claim_thesisSupervisionRank | null
    thesisExamCourseCode: string | null
    thesisExamDate: Date | null
    _count: ClaimCountAggregateOutputType | null
    _avg: ClaimAvgAggregateOutputType | null
    _sum: ClaimSumAggregateOutputType | null
    _min: ClaimMinAggregateOutputType | null
    _max: ClaimMaxAggregateOutputType | null
  }

  type GetClaimGroupByPayload<T extends ClaimGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ClaimGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ClaimGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ClaimGroupByOutputType[P]>
            : GetScalarType<T[P], ClaimGroupByOutputType[P]>
        }
      >
    >


  export type ClaimSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    claimType?: boolean
    status?: boolean
    submittedAt?: boolean
    updatedAt?: boolean
    processedAt?: boolean
    submittedById?: boolean
    centerId?: boolean
    processedById?: boolean
    teachingDate?: boolean
    teachingStartTime?: boolean
    teachingEndTime?: boolean
    teachingHours?: boolean
    transportType?: boolean
    transportDestinationTo?: boolean
    transportDestinationFrom?: boolean
    transportRegNumber?: boolean
    transportCubicCapacity?: boolean
    transportAmount?: boolean
    thesisType?: boolean
    thesisSupervisionRank?: boolean
    thesisExamCourseCode?: boolean
    thesisExamDate?: boolean
    Center?: boolean | CenterDefaultArgs<ExtArgs>
    User_Claim_processedByIdToUser?: boolean | Claim$User_Claim_processedByIdToUserArgs<ExtArgs>
    User_Claim_submittedByIdToUser?: boolean | UserDefaultArgs<ExtArgs>
    SupervisedStudent?: boolean | Claim$SupervisedStudentArgs<ExtArgs>
    _count?: boolean | ClaimCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["claim"]>



  export type ClaimSelectScalar = {
    id?: boolean
    claimType?: boolean
    status?: boolean
    submittedAt?: boolean
    updatedAt?: boolean
    processedAt?: boolean
    submittedById?: boolean
    centerId?: boolean
    processedById?: boolean
    teachingDate?: boolean
    teachingStartTime?: boolean
    teachingEndTime?: boolean
    teachingHours?: boolean
    transportType?: boolean
    transportDestinationTo?: boolean
    transportDestinationFrom?: boolean
    transportRegNumber?: boolean
    transportCubicCapacity?: boolean
    transportAmount?: boolean
    thesisType?: boolean
    thesisSupervisionRank?: boolean
    thesisExamCourseCode?: boolean
    thesisExamDate?: boolean
  }

  export type ClaimOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "claimType" | "status" | "submittedAt" | "updatedAt" | "processedAt" | "submittedById" | "centerId" | "processedById" | "teachingDate" | "teachingStartTime" | "teachingEndTime" | "teachingHours" | "transportType" | "transportDestinationTo" | "transportDestinationFrom" | "transportRegNumber" | "transportCubicCapacity" | "transportAmount" | "thesisType" | "thesisSupervisionRank" | "thesisExamCourseCode" | "thesisExamDate", ExtArgs["result"]["claim"]>
  export type ClaimInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    Center?: boolean | CenterDefaultArgs<ExtArgs>
    User_Claim_processedByIdToUser?: boolean | Claim$User_Claim_processedByIdToUserArgs<ExtArgs>
    User_Claim_submittedByIdToUser?: boolean | UserDefaultArgs<ExtArgs>
    SupervisedStudent?: boolean | Claim$SupervisedStudentArgs<ExtArgs>
    _count?: boolean | ClaimCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $ClaimPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Claim"
    objects: {
      Center: Prisma.$CenterPayload<ExtArgs>
      User_Claim_processedByIdToUser: Prisma.$UserPayload<ExtArgs> | null
      User_Claim_submittedByIdToUser: Prisma.$UserPayload<ExtArgs>
      SupervisedStudent: Prisma.$SupervisedStudentPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      claimType: $Enums.Claim_claimType
      status: $Enums.Claim_status
      submittedAt: Date
      updatedAt: Date
      processedAt: Date | null
      submittedById: string
      centerId: string
      processedById: string | null
      teachingDate: Date | null
      teachingStartTime: string | null
      teachingEndTime: string | null
      teachingHours: number | null
      transportType: $Enums.Claim_transportType | null
      transportDestinationTo: string | null
      transportDestinationFrom: string | null
      transportRegNumber: string | null
      transportCubicCapacity: number | null
      transportAmount: number | null
      thesisType: $Enums.Claim_thesisType | null
      thesisSupervisionRank: $Enums.Claim_thesisSupervisionRank | null
      thesisExamCourseCode: string | null
      thesisExamDate: Date | null
    }, ExtArgs["result"]["claim"]>
    composites: {}
  }

  type ClaimGetPayload<S extends boolean | null | undefined | ClaimDefaultArgs> = $Result.GetResult<Prisma.$ClaimPayload, S>

  type ClaimCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ClaimFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ClaimCountAggregateInputType | true
    }

  export interface ClaimDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Claim'], meta: { name: 'Claim' } }
    /**
     * Find zero or one Claim that matches the filter.
     * @param {ClaimFindUniqueArgs} args - Arguments to find a Claim
     * @example
     * // Get one Claim
     * const claim = await prisma.claim.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ClaimFindUniqueArgs>(args: SelectSubset<T, ClaimFindUniqueArgs<ExtArgs>>): Prisma__ClaimClient<$Result.GetResult<Prisma.$ClaimPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Claim that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ClaimFindUniqueOrThrowArgs} args - Arguments to find a Claim
     * @example
     * // Get one Claim
     * const claim = await prisma.claim.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ClaimFindUniqueOrThrowArgs>(args: SelectSubset<T, ClaimFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ClaimClient<$Result.GetResult<Prisma.$ClaimPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Claim that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClaimFindFirstArgs} args - Arguments to find a Claim
     * @example
     * // Get one Claim
     * const claim = await prisma.claim.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ClaimFindFirstArgs>(args?: SelectSubset<T, ClaimFindFirstArgs<ExtArgs>>): Prisma__ClaimClient<$Result.GetResult<Prisma.$ClaimPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Claim that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClaimFindFirstOrThrowArgs} args - Arguments to find a Claim
     * @example
     * // Get one Claim
     * const claim = await prisma.claim.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ClaimFindFirstOrThrowArgs>(args?: SelectSubset<T, ClaimFindFirstOrThrowArgs<ExtArgs>>): Prisma__ClaimClient<$Result.GetResult<Prisma.$ClaimPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Claims that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClaimFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Claims
     * const claims = await prisma.claim.findMany()
     * 
     * // Get first 10 Claims
     * const claims = await prisma.claim.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const claimWithIdOnly = await prisma.claim.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ClaimFindManyArgs>(args?: SelectSubset<T, ClaimFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClaimPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Claim.
     * @param {ClaimCreateArgs} args - Arguments to create a Claim.
     * @example
     * // Create one Claim
     * const Claim = await prisma.claim.create({
     *   data: {
     *     // ... data to create a Claim
     *   }
     * })
     * 
     */
    create<T extends ClaimCreateArgs>(args: SelectSubset<T, ClaimCreateArgs<ExtArgs>>): Prisma__ClaimClient<$Result.GetResult<Prisma.$ClaimPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Claims.
     * @param {ClaimCreateManyArgs} args - Arguments to create many Claims.
     * @example
     * // Create many Claims
     * const claim = await prisma.claim.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ClaimCreateManyArgs>(args?: SelectSubset<T, ClaimCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Claim.
     * @param {ClaimDeleteArgs} args - Arguments to delete one Claim.
     * @example
     * // Delete one Claim
     * const Claim = await prisma.claim.delete({
     *   where: {
     *     // ... filter to delete one Claim
     *   }
     * })
     * 
     */
    delete<T extends ClaimDeleteArgs>(args: SelectSubset<T, ClaimDeleteArgs<ExtArgs>>): Prisma__ClaimClient<$Result.GetResult<Prisma.$ClaimPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Claim.
     * @param {ClaimUpdateArgs} args - Arguments to update one Claim.
     * @example
     * // Update one Claim
     * const claim = await prisma.claim.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ClaimUpdateArgs>(args: SelectSubset<T, ClaimUpdateArgs<ExtArgs>>): Prisma__ClaimClient<$Result.GetResult<Prisma.$ClaimPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Claims.
     * @param {ClaimDeleteManyArgs} args - Arguments to filter Claims to delete.
     * @example
     * // Delete a few Claims
     * const { count } = await prisma.claim.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ClaimDeleteManyArgs>(args?: SelectSubset<T, ClaimDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Claims.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClaimUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Claims
     * const claim = await prisma.claim.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ClaimUpdateManyArgs>(args: SelectSubset<T, ClaimUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Claim.
     * @param {ClaimUpsertArgs} args - Arguments to update or create a Claim.
     * @example
     * // Update or create a Claim
     * const claim = await prisma.claim.upsert({
     *   create: {
     *     // ... data to create a Claim
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Claim we want to update
     *   }
     * })
     */
    upsert<T extends ClaimUpsertArgs>(args: SelectSubset<T, ClaimUpsertArgs<ExtArgs>>): Prisma__ClaimClient<$Result.GetResult<Prisma.$ClaimPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Claims.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClaimCountArgs} args - Arguments to filter Claims to count.
     * @example
     * // Count the number of Claims
     * const count = await prisma.claim.count({
     *   where: {
     *     // ... the filter for the Claims we want to count
     *   }
     * })
    **/
    count<T extends ClaimCountArgs>(
      args?: Subset<T, ClaimCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ClaimCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Claim.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClaimAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ClaimAggregateArgs>(args: Subset<T, ClaimAggregateArgs>): Prisma.PrismaPromise<GetClaimAggregateType<T>>

    /**
     * Group by Claim.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClaimGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ClaimGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ClaimGroupByArgs['orderBy'] }
        : { orderBy?: ClaimGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ClaimGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetClaimGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Claim model
   */
  readonly fields: ClaimFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Claim.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ClaimClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    Center<T extends CenterDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CenterDefaultArgs<ExtArgs>>): Prisma__CenterClient<$Result.GetResult<Prisma.$CenterPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    User_Claim_processedByIdToUser<T extends Claim$User_Claim_processedByIdToUserArgs<ExtArgs> = {}>(args?: Subset<T, Claim$User_Claim_processedByIdToUserArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    User_Claim_submittedByIdToUser<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    SupervisedStudent<T extends Claim$SupervisedStudentArgs<ExtArgs> = {}>(args?: Subset<T, Claim$SupervisedStudentArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SupervisedStudentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Claim model
   */
  interface ClaimFieldRefs {
    readonly id: FieldRef<"Claim", 'String'>
    readonly claimType: FieldRef<"Claim", 'Claim_claimType'>
    readonly status: FieldRef<"Claim", 'Claim_status'>
    readonly submittedAt: FieldRef<"Claim", 'DateTime'>
    readonly updatedAt: FieldRef<"Claim", 'DateTime'>
    readonly processedAt: FieldRef<"Claim", 'DateTime'>
    readonly submittedById: FieldRef<"Claim", 'String'>
    readonly centerId: FieldRef<"Claim", 'String'>
    readonly processedById: FieldRef<"Claim", 'String'>
    readonly teachingDate: FieldRef<"Claim", 'DateTime'>
    readonly teachingStartTime: FieldRef<"Claim", 'String'>
    readonly teachingEndTime: FieldRef<"Claim", 'String'>
    readonly teachingHours: FieldRef<"Claim", 'Float'>
    readonly transportType: FieldRef<"Claim", 'Claim_transportType'>
    readonly transportDestinationTo: FieldRef<"Claim", 'String'>
    readonly transportDestinationFrom: FieldRef<"Claim", 'String'>
    readonly transportRegNumber: FieldRef<"Claim", 'String'>
    readonly transportCubicCapacity: FieldRef<"Claim", 'Int'>
    readonly transportAmount: FieldRef<"Claim", 'Float'>
    readonly thesisType: FieldRef<"Claim", 'Claim_thesisType'>
    readonly thesisSupervisionRank: FieldRef<"Claim", 'Claim_thesisSupervisionRank'>
    readonly thesisExamCourseCode: FieldRef<"Claim", 'String'>
    readonly thesisExamDate: FieldRef<"Claim", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Claim findUnique
   */
  export type ClaimFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Claim
     */
    select?: ClaimSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Claim
     */
    omit?: ClaimOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClaimInclude<ExtArgs> | null
    /**
     * Filter, which Claim to fetch.
     */
    where: ClaimWhereUniqueInput
  }

  /**
   * Claim findUniqueOrThrow
   */
  export type ClaimFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Claim
     */
    select?: ClaimSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Claim
     */
    omit?: ClaimOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClaimInclude<ExtArgs> | null
    /**
     * Filter, which Claim to fetch.
     */
    where: ClaimWhereUniqueInput
  }

  /**
   * Claim findFirst
   */
  export type ClaimFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Claim
     */
    select?: ClaimSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Claim
     */
    omit?: ClaimOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClaimInclude<ExtArgs> | null
    /**
     * Filter, which Claim to fetch.
     */
    where?: ClaimWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Claims to fetch.
     */
    orderBy?: ClaimOrderByWithRelationInput | ClaimOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Claims.
     */
    cursor?: ClaimWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Claims from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Claims.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Claims.
     */
    distinct?: ClaimScalarFieldEnum | ClaimScalarFieldEnum[]
  }

  /**
   * Claim findFirstOrThrow
   */
  export type ClaimFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Claim
     */
    select?: ClaimSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Claim
     */
    omit?: ClaimOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClaimInclude<ExtArgs> | null
    /**
     * Filter, which Claim to fetch.
     */
    where?: ClaimWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Claims to fetch.
     */
    orderBy?: ClaimOrderByWithRelationInput | ClaimOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Claims.
     */
    cursor?: ClaimWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Claims from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Claims.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Claims.
     */
    distinct?: ClaimScalarFieldEnum | ClaimScalarFieldEnum[]
  }

  /**
   * Claim findMany
   */
  export type ClaimFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Claim
     */
    select?: ClaimSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Claim
     */
    omit?: ClaimOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClaimInclude<ExtArgs> | null
    /**
     * Filter, which Claims to fetch.
     */
    where?: ClaimWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Claims to fetch.
     */
    orderBy?: ClaimOrderByWithRelationInput | ClaimOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Claims.
     */
    cursor?: ClaimWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Claims from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Claims.
     */
    skip?: number
    distinct?: ClaimScalarFieldEnum | ClaimScalarFieldEnum[]
  }

  /**
   * Claim create
   */
  export type ClaimCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Claim
     */
    select?: ClaimSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Claim
     */
    omit?: ClaimOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClaimInclude<ExtArgs> | null
    /**
     * The data needed to create a Claim.
     */
    data: XOR<ClaimCreateInput, ClaimUncheckedCreateInput>
  }

  /**
   * Claim createMany
   */
  export type ClaimCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Claims.
     */
    data: ClaimCreateManyInput | ClaimCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Claim update
   */
  export type ClaimUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Claim
     */
    select?: ClaimSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Claim
     */
    omit?: ClaimOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClaimInclude<ExtArgs> | null
    /**
     * The data needed to update a Claim.
     */
    data: XOR<ClaimUpdateInput, ClaimUncheckedUpdateInput>
    /**
     * Choose, which Claim to update.
     */
    where: ClaimWhereUniqueInput
  }

  /**
   * Claim updateMany
   */
  export type ClaimUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Claims.
     */
    data: XOR<ClaimUpdateManyMutationInput, ClaimUncheckedUpdateManyInput>
    /**
     * Filter which Claims to update
     */
    where?: ClaimWhereInput
    /**
     * Limit how many Claims to update.
     */
    limit?: number
  }

  /**
   * Claim upsert
   */
  export type ClaimUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Claim
     */
    select?: ClaimSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Claim
     */
    omit?: ClaimOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClaimInclude<ExtArgs> | null
    /**
     * The filter to search for the Claim to update in case it exists.
     */
    where: ClaimWhereUniqueInput
    /**
     * In case the Claim found by the `where` argument doesn't exist, create a new Claim with this data.
     */
    create: XOR<ClaimCreateInput, ClaimUncheckedCreateInput>
    /**
     * In case the Claim was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ClaimUpdateInput, ClaimUncheckedUpdateInput>
  }

  /**
   * Claim delete
   */
  export type ClaimDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Claim
     */
    select?: ClaimSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Claim
     */
    omit?: ClaimOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClaimInclude<ExtArgs> | null
    /**
     * Filter which Claim to delete.
     */
    where: ClaimWhereUniqueInput
  }

  /**
   * Claim deleteMany
   */
  export type ClaimDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Claims to delete
     */
    where?: ClaimWhereInput
    /**
     * Limit how many Claims to delete.
     */
    limit?: number
  }

  /**
   * Claim.User_Claim_processedByIdToUser
   */
  export type Claim$User_Claim_processedByIdToUserArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * Claim.SupervisedStudent
   */
  export type Claim$SupervisedStudentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SupervisedStudent
     */
    select?: SupervisedStudentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SupervisedStudent
     */
    omit?: SupervisedStudentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SupervisedStudentInclude<ExtArgs> | null
    where?: SupervisedStudentWhereInput
    orderBy?: SupervisedStudentOrderByWithRelationInput | SupervisedStudentOrderByWithRelationInput[]
    cursor?: SupervisedStudentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SupervisedStudentScalarFieldEnum | SupervisedStudentScalarFieldEnum[]
  }

  /**
   * Claim without action
   */
  export type ClaimDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Claim
     */
    select?: ClaimSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Claim
     */
    omit?: ClaimOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClaimInclude<ExtArgs> | null
  }


  /**
   * Model Department
   */

  export type AggregateDepartment = {
    _count: DepartmentCountAggregateOutputType | null
    _min: DepartmentMinAggregateOutputType | null
    _max: DepartmentMaxAggregateOutputType | null
  }

  export type DepartmentMinAggregateOutputType = {
    id: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
    centerId: string | null
  }

  export type DepartmentMaxAggregateOutputType = {
    id: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
    centerId: string | null
  }

  export type DepartmentCountAggregateOutputType = {
    id: number
    name: number
    createdAt: number
    updatedAt: number
    centerId: number
    _all: number
  }


  export type DepartmentMinAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
    centerId?: true
  }

  export type DepartmentMaxAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
    centerId?: true
  }

  export type DepartmentCountAggregateInputType = {
    id?: true
    name?: true
    createdAt?: true
    updatedAt?: true
    centerId?: true
    _all?: true
  }

  export type DepartmentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Department to aggregate.
     */
    where?: DepartmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Departments to fetch.
     */
    orderBy?: DepartmentOrderByWithRelationInput | DepartmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DepartmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Departments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Departments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Departments
    **/
    _count?: true | DepartmentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DepartmentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DepartmentMaxAggregateInputType
  }

  export type GetDepartmentAggregateType<T extends DepartmentAggregateArgs> = {
        [P in keyof T & keyof AggregateDepartment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDepartment[P]>
      : GetScalarType<T[P], AggregateDepartment[P]>
  }




  export type DepartmentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DepartmentWhereInput
    orderBy?: DepartmentOrderByWithAggregationInput | DepartmentOrderByWithAggregationInput[]
    by: DepartmentScalarFieldEnum[] | DepartmentScalarFieldEnum
    having?: DepartmentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DepartmentCountAggregateInputType | true
    _min?: DepartmentMinAggregateInputType
    _max?: DepartmentMaxAggregateInputType
  }

  export type DepartmentGroupByOutputType = {
    id: string
    name: string
    createdAt: Date
    updatedAt: Date
    centerId: string
    _count: DepartmentCountAggregateOutputType | null
    _min: DepartmentMinAggregateOutputType | null
    _max: DepartmentMaxAggregateOutputType | null
  }

  type GetDepartmentGroupByPayload<T extends DepartmentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DepartmentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DepartmentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DepartmentGroupByOutputType[P]>
            : GetScalarType<T[P], DepartmentGroupByOutputType[P]>
        }
      >
    >


  export type DepartmentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    centerId?: boolean
    Center?: boolean | CenterDefaultArgs<ExtArgs>
    User?: boolean | Department$UserArgs<ExtArgs>
    _count?: boolean | DepartmentCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["department"]>



  export type DepartmentSelectScalar = {
    id?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    centerId?: boolean
  }

  export type DepartmentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "createdAt" | "updatedAt" | "centerId", ExtArgs["result"]["department"]>
  export type DepartmentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    Center?: boolean | CenterDefaultArgs<ExtArgs>
    User?: boolean | Department$UserArgs<ExtArgs>
    _count?: boolean | DepartmentCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $DepartmentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Department"
    objects: {
      Center: Prisma.$CenterPayload<ExtArgs>
      User: Prisma.$UserPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      createdAt: Date
      updatedAt: Date
      centerId: string
    }, ExtArgs["result"]["department"]>
    composites: {}
  }

  type DepartmentGetPayload<S extends boolean | null | undefined | DepartmentDefaultArgs> = $Result.GetResult<Prisma.$DepartmentPayload, S>

  type DepartmentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DepartmentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DepartmentCountAggregateInputType | true
    }

  export interface DepartmentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Department'], meta: { name: 'Department' } }
    /**
     * Find zero or one Department that matches the filter.
     * @param {DepartmentFindUniqueArgs} args - Arguments to find a Department
     * @example
     * // Get one Department
     * const department = await prisma.department.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DepartmentFindUniqueArgs>(args: SelectSubset<T, DepartmentFindUniqueArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Department that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DepartmentFindUniqueOrThrowArgs} args - Arguments to find a Department
     * @example
     * // Get one Department
     * const department = await prisma.department.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DepartmentFindUniqueOrThrowArgs>(args: SelectSubset<T, DepartmentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Department that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DepartmentFindFirstArgs} args - Arguments to find a Department
     * @example
     * // Get one Department
     * const department = await prisma.department.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DepartmentFindFirstArgs>(args?: SelectSubset<T, DepartmentFindFirstArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Department that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DepartmentFindFirstOrThrowArgs} args - Arguments to find a Department
     * @example
     * // Get one Department
     * const department = await prisma.department.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DepartmentFindFirstOrThrowArgs>(args?: SelectSubset<T, DepartmentFindFirstOrThrowArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Departments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DepartmentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Departments
     * const departments = await prisma.department.findMany()
     * 
     * // Get first 10 Departments
     * const departments = await prisma.department.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const departmentWithIdOnly = await prisma.department.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DepartmentFindManyArgs>(args?: SelectSubset<T, DepartmentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Department.
     * @param {DepartmentCreateArgs} args - Arguments to create a Department.
     * @example
     * // Create one Department
     * const Department = await prisma.department.create({
     *   data: {
     *     // ... data to create a Department
     *   }
     * })
     * 
     */
    create<T extends DepartmentCreateArgs>(args: SelectSubset<T, DepartmentCreateArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Departments.
     * @param {DepartmentCreateManyArgs} args - Arguments to create many Departments.
     * @example
     * // Create many Departments
     * const department = await prisma.department.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DepartmentCreateManyArgs>(args?: SelectSubset<T, DepartmentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Department.
     * @param {DepartmentDeleteArgs} args - Arguments to delete one Department.
     * @example
     * // Delete one Department
     * const Department = await prisma.department.delete({
     *   where: {
     *     // ... filter to delete one Department
     *   }
     * })
     * 
     */
    delete<T extends DepartmentDeleteArgs>(args: SelectSubset<T, DepartmentDeleteArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Department.
     * @param {DepartmentUpdateArgs} args - Arguments to update one Department.
     * @example
     * // Update one Department
     * const department = await prisma.department.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DepartmentUpdateArgs>(args: SelectSubset<T, DepartmentUpdateArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Departments.
     * @param {DepartmentDeleteManyArgs} args - Arguments to filter Departments to delete.
     * @example
     * // Delete a few Departments
     * const { count } = await prisma.department.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DepartmentDeleteManyArgs>(args?: SelectSubset<T, DepartmentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Departments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DepartmentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Departments
     * const department = await prisma.department.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DepartmentUpdateManyArgs>(args: SelectSubset<T, DepartmentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Department.
     * @param {DepartmentUpsertArgs} args - Arguments to update or create a Department.
     * @example
     * // Update or create a Department
     * const department = await prisma.department.upsert({
     *   create: {
     *     // ... data to create a Department
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Department we want to update
     *   }
     * })
     */
    upsert<T extends DepartmentUpsertArgs>(args: SelectSubset<T, DepartmentUpsertArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Departments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DepartmentCountArgs} args - Arguments to filter Departments to count.
     * @example
     * // Count the number of Departments
     * const count = await prisma.department.count({
     *   where: {
     *     // ... the filter for the Departments we want to count
     *   }
     * })
    **/
    count<T extends DepartmentCountArgs>(
      args?: Subset<T, DepartmentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DepartmentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Department.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DepartmentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DepartmentAggregateArgs>(args: Subset<T, DepartmentAggregateArgs>): Prisma.PrismaPromise<GetDepartmentAggregateType<T>>

    /**
     * Group by Department.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DepartmentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DepartmentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DepartmentGroupByArgs['orderBy'] }
        : { orderBy?: DepartmentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DepartmentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDepartmentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Department model
   */
  readonly fields: DepartmentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Department.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DepartmentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    Center<T extends CenterDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CenterDefaultArgs<ExtArgs>>): Prisma__CenterClient<$Result.GetResult<Prisma.$CenterPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    User<T extends Department$UserArgs<ExtArgs> = {}>(args?: Subset<T, Department$UserArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Department model
   */
  interface DepartmentFieldRefs {
    readonly id: FieldRef<"Department", 'String'>
    readonly name: FieldRef<"Department", 'String'>
    readonly createdAt: FieldRef<"Department", 'DateTime'>
    readonly updatedAt: FieldRef<"Department", 'DateTime'>
    readonly centerId: FieldRef<"Department", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Department findUnique
   */
  export type DepartmentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Department
     */
    omit?: DepartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * Filter, which Department to fetch.
     */
    where: DepartmentWhereUniqueInput
  }

  /**
   * Department findUniqueOrThrow
   */
  export type DepartmentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Department
     */
    omit?: DepartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * Filter, which Department to fetch.
     */
    where: DepartmentWhereUniqueInput
  }

  /**
   * Department findFirst
   */
  export type DepartmentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Department
     */
    omit?: DepartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * Filter, which Department to fetch.
     */
    where?: DepartmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Departments to fetch.
     */
    orderBy?: DepartmentOrderByWithRelationInput | DepartmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Departments.
     */
    cursor?: DepartmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Departments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Departments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Departments.
     */
    distinct?: DepartmentScalarFieldEnum | DepartmentScalarFieldEnum[]
  }

  /**
   * Department findFirstOrThrow
   */
  export type DepartmentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Department
     */
    omit?: DepartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * Filter, which Department to fetch.
     */
    where?: DepartmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Departments to fetch.
     */
    orderBy?: DepartmentOrderByWithRelationInput | DepartmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Departments.
     */
    cursor?: DepartmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Departments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Departments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Departments.
     */
    distinct?: DepartmentScalarFieldEnum | DepartmentScalarFieldEnum[]
  }

  /**
   * Department findMany
   */
  export type DepartmentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Department
     */
    omit?: DepartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * Filter, which Departments to fetch.
     */
    where?: DepartmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Departments to fetch.
     */
    orderBy?: DepartmentOrderByWithRelationInput | DepartmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Departments.
     */
    cursor?: DepartmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Departments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Departments.
     */
    skip?: number
    distinct?: DepartmentScalarFieldEnum | DepartmentScalarFieldEnum[]
  }

  /**
   * Department create
   */
  export type DepartmentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Department
     */
    omit?: DepartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * The data needed to create a Department.
     */
    data: XOR<DepartmentCreateInput, DepartmentUncheckedCreateInput>
  }

  /**
   * Department createMany
   */
  export type DepartmentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Departments.
     */
    data: DepartmentCreateManyInput | DepartmentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Department update
   */
  export type DepartmentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Department
     */
    omit?: DepartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * The data needed to update a Department.
     */
    data: XOR<DepartmentUpdateInput, DepartmentUncheckedUpdateInput>
    /**
     * Choose, which Department to update.
     */
    where: DepartmentWhereUniqueInput
  }

  /**
   * Department updateMany
   */
  export type DepartmentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Departments.
     */
    data: XOR<DepartmentUpdateManyMutationInput, DepartmentUncheckedUpdateManyInput>
    /**
     * Filter which Departments to update
     */
    where?: DepartmentWhereInput
    /**
     * Limit how many Departments to update.
     */
    limit?: number
  }

  /**
   * Department upsert
   */
  export type DepartmentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Department
     */
    omit?: DepartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * The filter to search for the Department to update in case it exists.
     */
    where: DepartmentWhereUniqueInput
    /**
     * In case the Department found by the `where` argument doesn't exist, create a new Department with this data.
     */
    create: XOR<DepartmentCreateInput, DepartmentUncheckedCreateInput>
    /**
     * In case the Department was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DepartmentUpdateInput, DepartmentUncheckedUpdateInput>
  }

  /**
   * Department delete
   */
  export type DepartmentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Department
     */
    omit?: DepartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    /**
     * Filter which Department to delete.
     */
    where: DepartmentWhereUniqueInput
  }

  /**
   * Department deleteMany
   */
  export type DepartmentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Departments to delete
     */
    where?: DepartmentWhereInput
    /**
     * Limit how many Departments to delete.
     */
    limit?: number
  }

  /**
   * Department.User
   */
  export type Department$UserArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    cursor?: UserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * Department without action
   */
  export type DepartmentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Department
     */
    omit?: DepartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
  }


  /**
   * Model SupervisedStudent
   */

  export type AggregateSupervisedStudent = {
    _count: SupervisedStudentCountAggregateOutputType | null
    _min: SupervisedStudentMinAggregateOutputType | null
    _max: SupervisedStudentMaxAggregateOutputType | null
  }

  export type SupervisedStudentMinAggregateOutputType = {
    id: string | null
    studentName: string | null
    thesisTitle: string | null
    claimId: string | null
    supervisorId: string | null
  }

  export type SupervisedStudentMaxAggregateOutputType = {
    id: string | null
    studentName: string | null
    thesisTitle: string | null
    claimId: string | null
    supervisorId: string | null
  }

  export type SupervisedStudentCountAggregateOutputType = {
    id: number
    studentName: number
    thesisTitle: number
    claimId: number
    supervisorId: number
    _all: number
  }


  export type SupervisedStudentMinAggregateInputType = {
    id?: true
    studentName?: true
    thesisTitle?: true
    claimId?: true
    supervisorId?: true
  }

  export type SupervisedStudentMaxAggregateInputType = {
    id?: true
    studentName?: true
    thesisTitle?: true
    claimId?: true
    supervisorId?: true
  }

  export type SupervisedStudentCountAggregateInputType = {
    id?: true
    studentName?: true
    thesisTitle?: true
    claimId?: true
    supervisorId?: true
    _all?: true
  }

  export type SupervisedStudentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SupervisedStudent to aggregate.
     */
    where?: SupervisedStudentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SupervisedStudents to fetch.
     */
    orderBy?: SupervisedStudentOrderByWithRelationInput | SupervisedStudentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SupervisedStudentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SupervisedStudents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SupervisedStudents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SupervisedStudents
    **/
    _count?: true | SupervisedStudentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SupervisedStudentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SupervisedStudentMaxAggregateInputType
  }

  export type GetSupervisedStudentAggregateType<T extends SupervisedStudentAggregateArgs> = {
        [P in keyof T & keyof AggregateSupervisedStudent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSupervisedStudent[P]>
      : GetScalarType<T[P], AggregateSupervisedStudent[P]>
  }




  export type SupervisedStudentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SupervisedStudentWhereInput
    orderBy?: SupervisedStudentOrderByWithAggregationInput | SupervisedStudentOrderByWithAggregationInput[]
    by: SupervisedStudentScalarFieldEnum[] | SupervisedStudentScalarFieldEnum
    having?: SupervisedStudentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SupervisedStudentCountAggregateInputType | true
    _min?: SupervisedStudentMinAggregateInputType
    _max?: SupervisedStudentMaxAggregateInputType
  }

  export type SupervisedStudentGroupByOutputType = {
    id: string
    studentName: string
    thesisTitle: string
    claimId: string
    supervisorId: string
    _count: SupervisedStudentCountAggregateOutputType | null
    _min: SupervisedStudentMinAggregateOutputType | null
    _max: SupervisedStudentMaxAggregateOutputType | null
  }

  type GetSupervisedStudentGroupByPayload<T extends SupervisedStudentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SupervisedStudentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SupervisedStudentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SupervisedStudentGroupByOutputType[P]>
            : GetScalarType<T[P], SupervisedStudentGroupByOutputType[P]>
        }
      >
    >


  export type SupervisedStudentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    studentName?: boolean
    thesisTitle?: boolean
    claimId?: boolean
    supervisorId?: boolean
    Claim?: boolean | ClaimDefaultArgs<ExtArgs>
    User?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["supervisedStudent"]>



  export type SupervisedStudentSelectScalar = {
    id?: boolean
    studentName?: boolean
    thesisTitle?: boolean
    claimId?: boolean
    supervisorId?: boolean
  }

  export type SupervisedStudentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "studentName" | "thesisTitle" | "claimId" | "supervisorId", ExtArgs["result"]["supervisedStudent"]>
  export type SupervisedStudentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    Claim?: boolean | ClaimDefaultArgs<ExtArgs>
    User?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $SupervisedStudentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SupervisedStudent"
    objects: {
      Claim: Prisma.$ClaimPayload<ExtArgs>
      User: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      studentName: string
      thesisTitle: string
      claimId: string
      supervisorId: string
    }, ExtArgs["result"]["supervisedStudent"]>
    composites: {}
  }

  type SupervisedStudentGetPayload<S extends boolean | null | undefined | SupervisedStudentDefaultArgs> = $Result.GetResult<Prisma.$SupervisedStudentPayload, S>

  type SupervisedStudentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SupervisedStudentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SupervisedStudentCountAggregateInputType | true
    }

  export interface SupervisedStudentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SupervisedStudent'], meta: { name: 'SupervisedStudent' } }
    /**
     * Find zero or one SupervisedStudent that matches the filter.
     * @param {SupervisedStudentFindUniqueArgs} args - Arguments to find a SupervisedStudent
     * @example
     * // Get one SupervisedStudent
     * const supervisedStudent = await prisma.supervisedStudent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SupervisedStudentFindUniqueArgs>(args: SelectSubset<T, SupervisedStudentFindUniqueArgs<ExtArgs>>): Prisma__SupervisedStudentClient<$Result.GetResult<Prisma.$SupervisedStudentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SupervisedStudent that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SupervisedStudentFindUniqueOrThrowArgs} args - Arguments to find a SupervisedStudent
     * @example
     * // Get one SupervisedStudent
     * const supervisedStudent = await prisma.supervisedStudent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SupervisedStudentFindUniqueOrThrowArgs>(args: SelectSubset<T, SupervisedStudentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SupervisedStudentClient<$Result.GetResult<Prisma.$SupervisedStudentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SupervisedStudent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SupervisedStudentFindFirstArgs} args - Arguments to find a SupervisedStudent
     * @example
     * // Get one SupervisedStudent
     * const supervisedStudent = await prisma.supervisedStudent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SupervisedStudentFindFirstArgs>(args?: SelectSubset<T, SupervisedStudentFindFirstArgs<ExtArgs>>): Prisma__SupervisedStudentClient<$Result.GetResult<Prisma.$SupervisedStudentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SupervisedStudent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SupervisedStudentFindFirstOrThrowArgs} args - Arguments to find a SupervisedStudent
     * @example
     * // Get one SupervisedStudent
     * const supervisedStudent = await prisma.supervisedStudent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SupervisedStudentFindFirstOrThrowArgs>(args?: SelectSubset<T, SupervisedStudentFindFirstOrThrowArgs<ExtArgs>>): Prisma__SupervisedStudentClient<$Result.GetResult<Prisma.$SupervisedStudentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SupervisedStudents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SupervisedStudentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SupervisedStudents
     * const supervisedStudents = await prisma.supervisedStudent.findMany()
     * 
     * // Get first 10 SupervisedStudents
     * const supervisedStudents = await prisma.supervisedStudent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const supervisedStudentWithIdOnly = await prisma.supervisedStudent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SupervisedStudentFindManyArgs>(args?: SelectSubset<T, SupervisedStudentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SupervisedStudentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SupervisedStudent.
     * @param {SupervisedStudentCreateArgs} args - Arguments to create a SupervisedStudent.
     * @example
     * // Create one SupervisedStudent
     * const SupervisedStudent = await prisma.supervisedStudent.create({
     *   data: {
     *     // ... data to create a SupervisedStudent
     *   }
     * })
     * 
     */
    create<T extends SupervisedStudentCreateArgs>(args: SelectSubset<T, SupervisedStudentCreateArgs<ExtArgs>>): Prisma__SupervisedStudentClient<$Result.GetResult<Prisma.$SupervisedStudentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SupervisedStudents.
     * @param {SupervisedStudentCreateManyArgs} args - Arguments to create many SupervisedStudents.
     * @example
     * // Create many SupervisedStudents
     * const supervisedStudent = await prisma.supervisedStudent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SupervisedStudentCreateManyArgs>(args?: SelectSubset<T, SupervisedStudentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a SupervisedStudent.
     * @param {SupervisedStudentDeleteArgs} args - Arguments to delete one SupervisedStudent.
     * @example
     * // Delete one SupervisedStudent
     * const SupervisedStudent = await prisma.supervisedStudent.delete({
     *   where: {
     *     // ... filter to delete one SupervisedStudent
     *   }
     * })
     * 
     */
    delete<T extends SupervisedStudentDeleteArgs>(args: SelectSubset<T, SupervisedStudentDeleteArgs<ExtArgs>>): Prisma__SupervisedStudentClient<$Result.GetResult<Prisma.$SupervisedStudentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SupervisedStudent.
     * @param {SupervisedStudentUpdateArgs} args - Arguments to update one SupervisedStudent.
     * @example
     * // Update one SupervisedStudent
     * const supervisedStudent = await prisma.supervisedStudent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SupervisedStudentUpdateArgs>(args: SelectSubset<T, SupervisedStudentUpdateArgs<ExtArgs>>): Prisma__SupervisedStudentClient<$Result.GetResult<Prisma.$SupervisedStudentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SupervisedStudents.
     * @param {SupervisedStudentDeleteManyArgs} args - Arguments to filter SupervisedStudents to delete.
     * @example
     * // Delete a few SupervisedStudents
     * const { count } = await prisma.supervisedStudent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SupervisedStudentDeleteManyArgs>(args?: SelectSubset<T, SupervisedStudentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SupervisedStudents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SupervisedStudentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SupervisedStudents
     * const supervisedStudent = await prisma.supervisedStudent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SupervisedStudentUpdateManyArgs>(args: SelectSubset<T, SupervisedStudentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one SupervisedStudent.
     * @param {SupervisedStudentUpsertArgs} args - Arguments to update or create a SupervisedStudent.
     * @example
     * // Update or create a SupervisedStudent
     * const supervisedStudent = await prisma.supervisedStudent.upsert({
     *   create: {
     *     // ... data to create a SupervisedStudent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SupervisedStudent we want to update
     *   }
     * })
     */
    upsert<T extends SupervisedStudentUpsertArgs>(args: SelectSubset<T, SupervisedStudentUpsertArgs<ExtArgs>>): Prisma__SupervisedStudentClient<$Result.GetResult<Prisma.$SupervisedStudentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SupervisedStudents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SupervisedStudentCountArgs} args - Arguments to filter SupervisedStudents to count.
     * @example
     * // Count the number of SupervisedStudents
     * const count = await prisma.supervisedStudent.count({
     *   where: {
     *     // ... the filter for the SupervisedStudents we want to count
     *   }
     * })
    **/
    count<T extends SupervisedStudentCountArgs>(
      args?: Subset<T, SupervisedStudentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SupervisedStudentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SupervisedStudent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SupervisedStudentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SupervisedStudentAggregateArgs>(args: Subset<T, SupervisedStudentAggregateArgs>): Prisma.PrismaPromise<GetSupervisedStudentAggregateType<T>>

    /**
     * Group by SupervisedStudent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SupervisedStudentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SupervisedStudentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SupervisedStudentGroupByArgs['orderBy'] }
        : { orderBy?: SupervisedStudentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SupervisedStudentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSupervisedStudentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SupervisedStudent model
   */
  readonly fields: SupervisedStudentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SupervisedStudent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SupervisedStudentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    Claim<T extends ClaimDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ClaimDefaultArgs<ExtArgs>>): Prisma__ClaimClient<$Result.GetResult<Prisma.$ClaimPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    User<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SupervisedStudent model
   */
  interface SupervisedStudentFieldRefs {
    readonly id: FieldRef<"SupervisedStudent", 'String'>
    readonly studentName: FieldRef<"SupervisedStudent", 'String'>
    readonly thesisTitle: FieldRef<"SupervisedStudent", 'String'>
    readonly claimId: FieldRef<"SupervisedStudent", 'String'>
    readonly supervisorId: FieldRef<"SupervisedStudent", 'String'>
  }
    

  // Custom InputTypes
  /**
   * SupervisedStudent findUnique
   */
  export type SupervisedStudentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SupervisedStudent
     */
    select?: SupervisedStudentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SupervisedStudent
     */
    omit?: SupervisedStudentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SupervisedStudentInclude<ExtArgs> | null
    /**
     * Filter, which SupervisedStudent to fetch.
     */
    where: SupervisedStudentWhereUniqueInput
  }

  /**
   * SupervisedStudent findUniqueOrThrow
   */
  export type SupervisedStudentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SupervisedStudent
     */
    select?: SupervisedStudentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SupervisedStudent
     */
    omit?: SupervisedStudentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SupervisedStudentInclude<ExtArgs> | null
    /**
     * Filter, which SupervisedStudent to fetch.
     */
    where: SupervisedStudentWhereUniqueInput
  }

  /**
   * SupervisedStudent findFirst
   */
  export type SupervisedStudentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SupervisedStudent
     */
    select?: SupervisedStudentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SupervisedStudent
     */
    omit?: SupervisedStudentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SupervisedStudentInclude<ExtArgs> | null
    /**
     * Filter, which SupervisedStudent to fetch.
     */
    where?: SupervisedStudentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SupervisedStudents to fetch.
     */
    orderBy?: SupervisedStudentOrderByWithRelationInput | SupervisedStudentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SupervisedStudents.
     */
    cursor?: SupervisedStudentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SupervisedStudents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SupervisedStudents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SupervisedStudents.
     */
    distinct?: SupervisedStudentScalarFieldEnum | SupervisedStudentScalarFieldEnum[]
  }

  /**
   * SupervisedStudent findFirstOrThrow
   */
  export type SupervisedStudentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SupervisedStudent
     */
    select?: SupervisedStudentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SupervisedStudent
     */
    omit?: SupervisedStudentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SupervisedStudentInclude<ExtArgs> | null
    /**
     * Filter, which SupervisedStudent to fetch.
     */
    where?: SupervisedStudentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SupervisedStudents to fetch.
     */
    orderBy?: SupervisedStudentOrderByWithRelationInput | SupervisedStudentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SupervisedStudents.
     */
    cursor?: SupervisedStudentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SupervisedStudents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SupervisedStudents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SupervisedStudents.
     */
    distinct?: SupervisedStudentScalarFieldEnum | SupervisedStudentScalarFieldEnum[]
  }

  /**
   * SupervisedStudent findMany
   */
  export type SupervisedStudentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SupervisedStudent
     */
    select?: SupervisedStudentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SupervisedStudent
     */
    omit?: SupervisedStudentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SupervisedStudentInclude<ExtArgs> | null
    /**
     * Filter, which SupervisedStudents to fetch.
     */
    where?: SupervisedStudentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SupervisedStudents to fetch.
     */
    orderBy?: SupervisedStudentOrderByWithRelationInput | SupervisedStudentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SupervisedStudents.
     */
    cursor?: SupervisedStudentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SupervisedStudents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SupervisedStudents.
     */
    skip?: number
    distinct?: SupervisedStudentScalarFieldEnum | SupervisedStudentScalarFieldEnum[]
  }

  /**
   * SupervisedStudent create
   */
  export type SupervisedStudentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SupervisedStudent
     */
    select?: SupervisedStudentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SupervisedStudent
     */
    omit?: SupervisedStudentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SupervisedStudentInclude<ExtArgs> | null
    /**
     * The data needed to create a SupervisedStudent.
     */
    data: XOR<SupervisedStudentCreateInput, SupervisedStudentUncheckedCreateInput>
  }

  /**
   * SupervisedStudent createMany
   */
  export type SupervisedStudentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SupervisedStudents.
     */
    data: SupervisedStudentCreateManyInput | SupervisedStudentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SupervisedStudent update
   */
  export type SupervisedStudentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SupervisedStudent
     */
    select?: SupervisedStudentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SupervisedStudent
     */
    omit?: SupervisedStudentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SupervisedStudentInclude<ExtArgs> | null
    /**
     * The data needed to update a SupervisedStudent.
     */
    data: XOR<SupervisedStudentUpdateInput, SupervisedStudentUncheckedUpdateInput>
    /**
     * Choose, which SupervisedStudent to update.
     */
    where: SupervisedStudentWhereUniqueInput
  }

  /**
   * SupervisedStudent updateMany
   */
  export type SupervisedStudentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SupervisedStudents.
     */
    data: XOR<SupervisedStudentUpdateManyMutationInput, SupervisedStudentUncheckedUpdateManyInput>
    /**
     * Filter which SupervisedStudents to update
     */
    where?: SupervisedStudentWhereInput
    /**
     * Limit how many SupervisedStudents to update.
     */
    limit?: number
  }

  /**
   * SupervisedStudent upsert
   */
  export type SupervisedStudentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SupervisedStudent
     */
    select?: SupervisedStudentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SupervisedStudent
     */
    omit?: SupervisedStudentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SupervisedStudentInclude<ExtArgs> | null
    /**
     * The filter to search for the SupervisedStudent to update in case it exists.
     */
    where: SupervisedStudentWhereUniqueInput
    /**
     * In case the SupervisedStudent found by the `where` argument doesn't exist, create a new SupervisedStudent with this data.
     */
    create: XOR<SupervisedStudentCreateInput, SupervisedStudentUncheckedCreateInput>
    /**
     * In case the SupervisedStudent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SupervisedStudentUpdateInput, SupervisedStudentUncheckedUpdateInput>
  }

  /**
   * SupervisedStudent delete
   */
  export type SupervisedStudentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SupervisedStudent
     */
    select?: SupervisedStudentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SupervisedStudent
     */
    omit?: SupervisedStudentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SupervisedStudentInclude<ExtArgs> | null
    /**
     * Filter which SupervisedStudent to delete.
     */
    where: SupervisedStudentWhereUniqueInput
  }

  /**
   * SupervisedStudent deleteMany
   */
  export type SupervisedStudentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SupervisedStudents to delete
     */
    where?: SupervisedStudentWhereInput
    /**
     * Limit how many SupervisedStudents to delete.
     */
    limit?: number
  }

  /**
   * SupervisedStudent without action
   */
  export type SupervisedStudentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SupervisedStudent
     */
    select?: SupervisedStudentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SupervisedStudent
     */
    omit?: SupervisedStudentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SupervisedStudentInclude<ExtArgs> | null
  }


  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    password: string | null
    role: $Enums.User_role | null
    createdAt: Date | null
    updatedAt: Date | null
    lecturerCenterId: string | null
    departmentId: string | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    password: string | null
    role: $Enums.User_role | null
    createdAt: Date | null
    updatedAt: Date | null
    lecturerCenterId: string | null
    departmentId: string | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    name: number
    password: number
    role: number
    createdAt: number
    updatedAt: number
    lecturerCenterId: number
    departmentId: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    name?: true
    password?: true
    role?: true
    createdAt?: true
    updatedAt?: true
    lecturerCenterId?: true
    departmentId?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    name?: true
    password?: true
    role?: true
    createdAt?: true
    updatedAt?: true
    lecturerCenterId?: true
    departmentId?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    name?: true
    password?: true
    role?: true
    createdAt?: true
    updatedAt?: true
    lecturerCenterId?: true
    departmentId?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    name: string | null
    password: string
    role: $Enums.User_role
    createdAt: Date
    updatedAt: Date
    lecturerCenterId: string | null
    departmentId: string | null
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    password?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    lecturerCenterId?: boolean
    departmentId?: boolean
    Center_Center_coordinatorIdToUser?: boolean | User$Center_Center_coordinatorIdToUserArgs<ExtArgs>
    Claim_Claim_processedByIdToUser?: boolean | User$Claim_Claim_processedByIdToUserArgs<ExtArgs>
    Claim_Claim_submittedByIdToUser?: boolean | User$Claim_Claim_submittedByIdToUserArgs<ExtArgs>
    SupervisedStudent?: boolean | User$SupervisedStudentArgs<ExtArgs>
    Department?: boolean | User$DepartmentArgs<ExtArgs>
    Center_User_lecturerCenterIdToCenter?: boolean | User$Center_User_lecturerCenterIdToCenterArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>



  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    name?: boolean
    password?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    lecturerCenterId?: boolean
    departmentId?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "name" | "password" | "role" | "createdAt" | "updatedAt" | "lecturerCenterId" | "departmentId", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    Center_Center_coordinatorIdToUser?: boolean | User$Center_Center_coordinatorIdToUserArgs<ExtArgs>
    Claim_Claim_processedByIdToUser?: boolean | User$Claim_Claim_processedByIdToUserArgs<ExtArgs>
    Claim_Claim_submittedByIdToUser?: boolean | User$Claim_Claim_submittedByIdToUserArgs<ExtArgs>
    SupervisedStudent?: boolean | User$SupervisedStudentArgs<ExtArgs>
    Department?: boolean | User$DepartmentArgs<ExtArgs>
    Center_User_lecturerCenterIdToCenter?: boolean | User$Center_User_lecturerCenterIdToCenterArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      Center_Center_coordinatorIdToUser: Prisma.$CenterPayload<ExtArgs> | null
      Claim_Claim_processedByIdToUser: Prisma.$ClaimPayload<ExtArgs>[]
      Claim_Claim_submittedByIdToUser: Prisma.$ClaimPayload<ExtArgs>[]
      SupervisedStudent: Prisma.$SupervisedStudentPayload<ExtArgs>[]
      Department: Prisma.$DepartmentPayload<ExtArgs> | null
      Center_User_lecturerCenterIdToCenter: Prisma.$CenterPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      name: string | null
      password: string
      role: $Enums.User_role
      createdAt: Date
      updatedAt: Date
      lecturerCenterId: string | null
      departmentId: string | null
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    Center_Center_coordinatorIdToUser<T extends User$Center_Center_coordinatorIdToUserArgs<ExtArgs> = {}>(args?: Subset<T, User$Center_Center_coordinatorIdToUserArgs<ExtArgs>>): Prisma__CenterClient<$Result.GetResult<Prisma.$CenterPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    Claim_Claim_processedByIdToUser<T extends User$Claim_Claim_processedByIdToUserArgs<ExtArgs> = {}>(args?: Subset<T, User$Claim_Claim_processedByIdToUserArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClaimPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    Claim_Claim_submittedByIdToUser<T extends User$Claim_Claim_submittedByIdToUserArgs<ExtArgs> = {}>(args?: Subset<T, User$Claim_Claim_submittedByIdToUserArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClaimPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    SupervisedStudent<T extends User$SupervisedStudentArgs<ExtArgs> = {}>(args?: Subset<T, User$SupervisedStudentArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SupervisedStudentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    Department<T extends User$DepartmentArgs<ExtArgs> = {}>(args?: Subset<T, User$DepartmentArgs<ExtArgs>>): Prisma__DepartmentClient<$Result.GetResult<Prisma.$DepartmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    Center_User_lecturerCenterIdToCenter<T extends User$Center_User_lecturerCenterIdToCenterArgs<ExtArgs> = {}>(args?: Subset<T, User$Center_User_lecturerCenterIdToCenterArgs<ExtArgs>>): Prisma__CenterClient<$Result.GetResult<Prisma.$CenterPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'User_role'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
    readonly lecturerCenterId: FieldRef<"User", 'String'>
    readonly departmentId: FieldRef<"User", 'String'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.Center_Center_coordinatorIdToUser
   */
  export type User$Center_Center_coordinatorIdToUserArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Center
     */
    select?: CenterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Center
     */
    omit?: CenterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CenterInclude<ExtArgs> | null
    where?: CenterWhereInput
  }

  /**
   * User.Claim_Claim_processedByIdToUser
   */
  export type User$Claim_Claim_processedByIdToUserArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Claim
     */
    select?: ClaimSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Claim
     */
    omit?: ClaimOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClaimInclude<ExtArgs> | null
    where?: ClaimWhereInput
    orderBy?: ClaimOrderByWithRelationInput | ClaimOrderByWithRelationInput[]
    cursor?: ClaimWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ClaimScalarFieldEnum | ClaimScalarFieldEnum[]
  }

  /**
   * User.Claim_Claim_submittedByIdToUser
   */
  export type User$Claim_Claim_submittedByIdToUserArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Claim
     */
    select?: ClaimSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Claim
     */
    omit?: ClaimOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClaimInclude<ExtArgs> | null
    where?: ClaimWhereInput
    orderBy?: ClaimOrderByWithRelationInput | ClaimOrderByWithRelationInput[]
    cursor?: ClaimWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ClaimScalarFieldEnum | ClaimScalarFieldEnum[]
  }

  /**
   * User.SupervisedStudent
   */
  export type User$SupervisedStudentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SupervisedStudent
     */
    select?: SupervisedStudentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SupervisedStudent
     */
    omit?: SupervisedStudentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SupervisedStudentInclude<ExtArgs> | null
    where?: SupervisedStudentWhereInput
    orderBy?: SupervisedStudentOrderByWithRelationInput | SupervisedStudentOrderByWithRelationInput[]
    cursor?: SupervisedStudentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SupervisedStudentScalarFieldEnum | SupervisedStudentScalarFieldEnum[]
  }

  /**
   * User.Department
   */
  export type User$DepartmentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Department
     */
    select?: DepartmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Department
     */
    omit?: DepartmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DepartmentInclude<ExtArgs> | null
    where?: DepartmentWhereInput
  }

  /**
   * User.Center_User_lecturerCenterIdToCenter
   */
  export type User$Center_User_lecturerCenterIdToCenterArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Center
     */
    select?: CenterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Center
     */
    omit?: CenterOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CenterInclude<ExtArgs> | null
    where?: CenterWhereInput
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const CenterScalarFieldEnum: {
    id: 'id',
    name: 'name',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    coordinatorId: 'coordinatorId'
  };

  export type CenterScalarFieldEnum = (typeof CenterScalarFieldEnum)[keyof typeof CenterScalarFieldEnum]


  export const ClaimScalarFieldEnum: {
    id: 'id',
    claimType: 'claimType',
    status: 'status',
    submittedAt: 'submittedAt',
    updatedAt: 'updatedAt',
    processedAt: 'processedAt',
    submittedById: 'submittedById',
    centerId: 'centerId',
    processedById: 'processedById',
    teachingDate: 'teachingDate',
    teachingStartTime: 'teachingStartTime',
    teachingEndTime: 'teachingEndTime',
    teachingHours: 'teachingHours',
    transportType: 'transportType',
    transportDestinationTo: 'transportDestinationTo',
    transportDestinationFrom: 'transportDestinationFrom',
    transportRegNumber: 'transportRegNumber',
    transportCubicCapacity: 'transportCubicCapacity',
    transportAmount: 'transportAmount',
    thesisType: 'thesisType',
    thesisSupervisionRank: 'thesisSupervisionRank',
    thesisExamCourseCode: 'thesisExamCourseCode',
    thesisExamDate: 'thesisExamDate'
  };

  export type ClaimScalarFieldEnum = (typeof ClaimScalarFieldEnum)[keyof typeof ClaimScalarFieldEnum]


  export const DepartmentScalarFieldEnum: {
    id: 'id',
    name: 'name',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    centerId: 'centerId'
  };

  export type DepartmentScalarFieldEnum = (typeof DepartmentScalarFieldEnum)[keyof typeof DepartmentScalarFieldEnum]


  export const SupervisedStudentScalarFieldEnum: {
    id: 'id',
    studentName: 'studentName',
    thesisTitle: 'thesisTitle',
    claimId: 'claimId',
    supervisorId: 'supervisorId'
  };

  export type SupervisedStudentScalarFieldEnum = (typeof SupervisedStudentScalarFieldEnum)[keyof typeof SupervisedStudentScalarFieldEnum]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    name: 'name',
    password: 'password',
    role: 'role',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    lecturerCenterId: 'lecturerCenterId',
    departmentId: 'departmentId'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const CenterOrderByRelevanceFieldEnum: {
    id: 'id',
    name: 'name',
    coordinatorId: 'coordinatorId'
  };

  export type CenterOrderByRelevanceFieldEnum = (typeof CenterOrderByRelevanceFieldEnum)[keyof typeof CenterOrderByRelevanceFieldEnum]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const ClaimOrderByRelevanceFieldEnum: {
    id: 'id',
    submittedById: 'submittedById',
    centerId: 'centerId',
    processedById: 'processedById',
    teachingStartTime: 'teachingStartTime',
    teachingEndTime: 'teachingEndTime',
    transportDestinationTo: 'transportDestinationTo',
    transportDestinationFrom: 'transportDestinationFrom',
    transportRegNumber: 'transportRegNumber',
    thesisExamCourseCode: 'thesisExamCourseCode'
  };

  export type ClaimOrderByRelevanceFieldEnum = (typeof ClaimOrderByRelevanceFieldEnum)[keyof typeof ClaimOrderByRelevanceFieldEnum]


  export const DepartmentOrderByRelevanceFieldEnum: {
    id: 'id',
    name: 'name',
    centerId: 'centerId'
  };

  export type DepartmentOrderByRelevanceFieldEnum = (typeof DepartmentOrderByRelevanceFieldEnum)[keyof typeof DepartmentOrderByRelevanceFieldEnum]


  export const SupervisedStudentOrderByRelevanceFieldEnum: {
    id: 'id',
    studentName: 'studentName',
    thesisTitle: 'thesisTitle',
    claimId: 'claimId',
    supervisorId: 'supervisorId'
  };

  export type SupervisedStudentOrderByRelevanceFieldEnum = (typeof SupervisedStudentOrderByRelevanceFieldEnum)[keyof typeof SupervisedStudentOrderByRelevanceFieldEnum]


  export const UserOrderByRelevanceFieldEnum: {
    id: 'id',
    email: 'email',
    name: 'name',
    password: 'password',
    lecturerCenterId: 'lecturerCenterId',
    departmentId: 'departmentId'
  };

  export type UserOrderByRelevanceFieldEnum = (typeof UserOrderByRelevanceFieldEnum)[keyof typeof UserOrderByRelevanceFieldEnum]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Claim_claimType'
   */
  export type EnumClaim_claimTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Claim_claimType'>
    


  /**
   * Reference to a field of type 'Claim_status'
   */
  export type EnumClaim_statusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Claim_status'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Claim_transportType'
   */
  export type EnumClaim_transportTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Claim_transportType'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Claim_thesisType'
   */
  export type EnumClaim_thesisTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Claim_thesisType'>
    


  /**
   * Reference to a field of type 'Claim_thesisSupervisionRank'
   */
  export type EnumClaim_thesisSupervisionRankFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Claim_thesisSupervisionRank'>
    


  /**
   * Reference to a field of type 'User_role'
   */
  export type EnumUser_roleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'User_role'>
    
  /**
   * Deep Input Types
   */


  export type CenterWhereInput = {
    AND?: CenterWhereInput | CenterWhereInput[]
    OR?: CenterWhereInput[]
    NOT?: CenterWhereInput | CenterWhereInput[]
    id?: StringFilter<"Center"> | string
    name?: StringFilter<"Center"> | string
    createdAt?: DateTimeFilter<"Center"> | Date | string
    updatedAt?: DateTimeFilter<"Center"> | Date | string
    coordinatorId?: StringFilter<"Center"> | string
    User_Center_coordinatorIdToUser?: XOR<UserScalarRelationFilter, UserWhereInput>
    Claim?: ClaimListRelationFilter
    Department?: DepartmentListRelationFilter
    User_User_lecturerCenterIdToCenter?: UserListRelationFilter
  }

  export type CenterOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    coordinatorId?: SortOrder
    User_Center_coordinatorIdToUser?: UserOrderByWithRelationInput
    Claim?: ClaimOrderByRelationAggregateInput
    Department?: DepartmentOrderByRelationAggregateInput
    User_User_lecturerCenterIdToCenter?: UserOrderByRelationAggregateInput
    _relevance?: CenterOrderByRelevanceInput
  }

  export type CenterWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    name?: string
    coordinatorId?: string
    AND?: CenterWhereInput | CenterWhereInput[]
    OR?: CenterWhereInput[]
    NOT?: CenterWhereInput | CenterWhereInput[]
    createdAt?: DateTimeFilter<"Center"> | Date | string
    updatedAt?: DateTimeFilter<"Center"> | Date | string
    User_Center_coordinatorIdToUser?: XOR<UserScalarRelationFilter, UserWhereInput>
    Claim?: ClaimListRelationFilter
    Department?: DepartmentListRelationFilter
    User_User_lecturerCenterIdToCenter?: UserListRelationFilter
  }, "id" | "name" | "coordinatorId">

  export type CenterOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    coordinatorId?: SortOrder
    _count?: CenterCountOrderByAggregateInput
    _max?: CenterMaxOrderByAggregateInput
    _min?: CenterMinOrderByAggregateInput
  }

  export type CenterScalarWhereWithAggregatesInput = {
    AND?: CenterScalarWhereWithAggregatesInput | CenterScalarWhereWithAggregatesInput[]
    OR?: CenterScalarWhereWithAggregatesInput[]
    NOT?: CenterScalarWhereWithAggregatesInput | CenterScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Center"> | string
    name?: StringWithAggregatesFilter<"Center"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Center"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Center"> | Date | string
    coordinatorId?: StringWithAggregatesFilter<"Center"> | string
  }

  export type ClaimWhereInput = {
    AND?: ClaimWhereInput | ClaimWhereInput[]
    OR?: ClaimWhereInput[]
    NOT?: ClaimWhereInput | ClaimWhereInput[]
    id?: StringFilter<"Claim"> | string
    claimType?: EnumClaim_claimTypeFilter<"Claim"> | $Enums.Claim_claimType
    status?: EnumClaim_statusFilter<"Claim"> | $Enums.Claim_status
    submittedAt?: DateTimeFilter<"Claim"> | Date | string
    updatedAt?: DateTimeFilter<"Claim"> | Date | string
    processedAt?: DateTimeNullableFilter<"Claim"> | Date | string | null
    submittedById?: StringFilter<"Claim"> | string
    centerId?: StringFilter<"Claim"> | string
    processedById?: StringNullableFilter<"Claim"> | string | null
    teachingDate?: DateTimeNullableFilter<"Claim"> | Date | string | null
    teachingStartTime?: StringNullableFilter<"Claim"> | string | null
    teachingEndTime?: StringNullableFilter<"Claim"> | string | null
    teachingHours?: FloatNullableFilter<"Claim"> | number | null
    transportType?: EnumClaim_transportTypeNullableFilter<"Claim"> | $Enums.Claim_transportType | null
    transportDestinationTo?: StringNullableFilter<"Claim"> | string | null
    transportDestinationFrom?: StringNullableFilter<"Claim"> | string | null
    transportRegNumber?: StringNullableFilter<"Claim"> | string | null
    transportCubicCapacity?: IntNullableFilter<"Claim"> | number | null
    transportAmount?: FloatNullableFilter<"Claim"> | number | null
    thesisType?: EnumClaim_thesisTypeNullableFilter<"Claim"> | $Enums.Claim_thesisType | null
    thesisSupervisionRank?: EnumClaim_thesisSupervisionRankNullableFilter<"Claim"> | $Enums.Claim_thesisSupervisionRank | null
    thesisExamCourseCode?: StringNullableFilter<"Claim"> | string | null
    thesisExamDate?: DateTimeNullableFilter<"Claim"> | Date | string | null
    Center?: XOR<CenterScalarRelationFilter, CenterWhereInput>
    User_Claim_processedByIdToUser?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    User_Claim_submittedByIdToUser?: XOR<UserScalarRelationFilter, UserWhereInput>
    SupervisedStudent?: SupervisedStudentListRelationFilter
  }

  export type ClaimOrderByWithRelationInput = {
    id?: SortOrder
    claimType?: SortOrder
    status?: SortOrder
    submittedAt?: SortOrder
    updatedAt?: SortOrder
    processedAt?: SortOrderInput | SortOrder
    submittedById?: SortOrder
    centerId?: SortOrder
    processedById?: SortOrderInput | SortOrder
    teachingDate?: SortOrderInput | SortOrder
    teachingStartTime?: SortOrderInput | SortOrder
    teachingEndTime?: SortOrderInput | SortOrder
    teachingHours?: SortOrderInput | SortOrder
    transportType?: SortOrderInput | SortOrder
    transportDestinationTo?: SortOrderInput | SortOrder
    transportDestinationFrom?: SortOrderInput | SortOrder
    transportRegNumber?: SortOrderInput | SortOrder
    transportCubicCapacity?: SortOrderInput | SortOrder
    transportAmount?: SortOrderInput | SortOrder
    thesisType?: SortOrderInput | SortOrder
    thesisSupervisionRank?: SortOrderInput | SortOrder
    thesisExamCourseCode?: SortOrderInput | SortOrder
    thesisExamDate?: SortOrderInput | SortOrder
    Center?: CenterOrderByWithRelationInput
    User_Claim_processedByIdToUser?: UserOrderByWithRelationInput
    User_Claim_submittedByIdToUser?: UserOrderByWithRelationInput
    SupervisedStudent?: SupervisedStudentOrderByRelationAggregateInput
    _relevance?: ClaimOrderByRelevanceInput
  }

  export type ClaimWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ClaimWhereInput | ClaimWhereInput[]
    OR?: ClaimWhereInput[]
    NOT?: ClaimWhereInput | ClaimWhereInput[]
    claimType?: EnumClaim_claimTypeFilter<"Claim"> | $Enums.Claim_claimType
    status?: EnumClaim_statusFilter<"Claim"> | $Enums.Claim_status
    submittedAt?: DateTimeFilter<"Claim"> | Date | string
    updatedAt?: DateTimeFilter<"Claim"> | Date | string
    processedAt?: DateTimeNullableFilter<"Claim"> | Date | string | null
    submittedById?: StringFilter<"Claim"> | string
    centerId?: StringFilter<"Claim"> | string
    processedById?: StringNullableFilter<"Claim"> | string | null
    teachingDate?: DateTimeNullableFilter<"Claim"> | Date | string | null
    teachingStartTime?: StringNullableFilter<"Claim"> | string | null
    teachingEndTime?: StringNullableFilter<"Claim"> | string | null
    teachingHours?: FloatNullableFilter<"Claim"> | number | null
    transportType?: EnumClaim_transportTypeNullableFilter<"Claim"> | $Enums.Claim_transportType | null
    transportDestinationTo?: StringNullableFilter<"Claim"> | string | null
    transportDestinationFrom?: StringNullableFilter<"Claim"> | string | null
    transportRegNumber?: StringNullableFilter<"Claim"> | string | null
    transportCubicCapacity?: IntNullableFilter<"Claim"> | number | null
    transportAmount?: FloatNullableFilter<"Claim"> | number | null
    thesisType?: EnumClaim_thesisTypeNullableFilter<"Claim"> | $Enums.Claim_thesisType | null
    thesisSupervisionRank?: EnumClaim_thesisSupervisionRankNullableFilter<"Claim"> | $Enums.Claim_thesisSupervisionRank | null
    thesisExamCourseCode?: StringNullableFilter<"Claim"> | string | null
    thesisExamDate?: DateTimeNullableFilter<"Claim"> | Date | string | null
    Center?: XOR<CenterScalarRelationFilter, CenterWhereInput>
    User_Claim_processedByIdToUser?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    User_Claim_submittedByIdToUser?: XOR<UserScalarRelationFilter, UserWhereInput>
    SupervisedStudent?: SupervisedStudentListRelationFilter
  }, "id">

  export type ClaimOrderByWithAggregationInput = {
    id?: SortOrder
    claimType?: SortOrder
    status?: SortOrder
    submittedAt?: SortOrder
    updatedAt?: SortOrder
    processedAt?: SortOrderInput | SortOrder
    submittedById?: SortOrder
    centerId?: SortOrder
    processedById?: SortOrderInput | SortOrder
    teachingDate?: SortOrderInput | SortOrder
    teachingStartTime?: SortOrderInput | SortOrder
    teachingEndTime?: SortOrderInput | SortOrder
    teachingHours?: SortOrderInput | SortOrder
    transportType?: SortOrderInput | SortOrder
    transportDestinationTo?: SortOrderInput | SortOrder
    transportDestinationFrom?: SortOrderInput | SortOrder
    transportRegNumber?: SortOrderInput | SortOrder
    transportCubicCapacity?: SortOrderInput | SortOrder
    transportAmount?: SortOrderInput | SortOrder
    thesisType?: SortOrderInput | SortOrder
    thesisSupervisionRank?: SortOrderInput | SortOrder
    thesisExamCourseCode?: SortOrderInput | SortOrder
    thesisExamDate?: SortOrderInput | SortOrder
    _count?: ClaimCountOrderByAggregateInput
    _avg?: ClaimAvgOrderByAggregateInput
    _max?: ClaimMaxOrderByAggregateInput
    _min?: ClaimMinOrderByAggregateInput
    _sum?: ClaimSumOrderByAggregateInput
  }

  export type ClaimScalarWhereWithAggregatesInput = {
    AND?: ClaimScalarWhereWithAggregatesInput | ClaimScalarWhereWithAggregatesInput[]
    OR?: ClaimScalarWhereWithAggregatesInput[]
    NOT?: ClaimScalarWhereWithAggregatesInput | ClaimScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Claim"> | string
    claimType?: EnumClaim_claimTypeWithAggregatesFilter<"Claim"> | $Enums.Claim_claimType
    status?: EnumClaim_statusWithAggregatesFilter<"Claim"> | $Enums.Claim_status
    submittedAt?: DateTimeWithAggregatesFilter<"Claim"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Claim"> | Date | string
    processedAt?: DateTimeNullableWithAggregatesFilter<"Claim"> | Date | string | null
    submittedById?: StringWithAggregatesFilter<"Claim"> | string
    centerId?: StringWithAggregatesFilter<"Claim"> | string
    processedById?: StringNullableWithAggregatesFilter<"Claim"> | string | null
    teachingDate?: DateTimeNullableWithAggregatesFilter<"Claim"> | Date | string | null
    teachingStartTime?: StringNullableWithAggregatesFilter<"Claim"> | string | null
    teachingEndTime?: StringNullableWithAggregatesFilter<"Claim"> | string | null
    teachingHours?: FloatNullableWithAggregatesFilter<"Claim"> | number | null
    transportType?: EnumClaim_transportTypeNullableWithAggregatesFilter<"Claim"> | $Enums.Claim_transportType | null
    transportDestinationTo?: StringNullableWithAggregatesFilter<"Claim"> | string | null
    transportDestinationFrom?: StringNullableWithAggregatesFilter<"Claim"> | string | null
    transportRegNumber?: StringNullableWithAggregatesFilter<"Claim"> | string | null
    transportCubicCapacity?: IntNullableWithAggregatesFilter<"Claim"> | number | null
    transportAmount?: FloatNullableWithAggregatesFilter<"Claim"> | number | null
    thesisType?: EnumClaim_thesisTypeNullableWithAggregatesFilter<"Claim"> | $Enums.Claim_thesisType | null
    thesisSupervisionRank?: EnumClaim_thesisSupervisionRankNullableWithAggregatesFilter<"Claim"> | $Enums.Claim_thesisSupervisionRank | null
    thesisExamCourseCode?: StringNullableWithAggregatesFilter<"Claim"> | string | null
    thesisExamDate?: DateTimeNullableWithAggregatesFilter<"Claim"> | Date | string | null
  }

  export type DepartmentWhereInput = {
    AND?: DepartmentWhereInput | DepartmentWhereInput[]
    OR?: DepartmentWhereInput[]
    NOT?: DepartmentWhereInput | DepartmentWhereInput[]
    id?: StringFilter<"Department"> | string
    name?: StringFilter<"Department"> | string
    createdAt?: DateTimeFilter<"Department"> | Date | string
    updatedAt?: DateTimeFilter<"Department"> | Date | string
    centerId?: StringFilter<"Department"> | string
    Center?: XOR<CenterScalarRelationFilter, CenterWhereInput>
    User?: UserListRelationFilter
  }

  export type DepartmentOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    centerId?: SortOrder
    Center?: CenterOrderByWithRelationInput
    User?: UserOrderByRelationAggregateInput
    _relevance?: DepartmentOrderByRelevanceInput
  }

  export type DepartmentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    name_centerId?: DepartmentNameCenterIdCompoundUniqueInput
    AND?: DepartmentWhereInput | DepartmentWhereInput[]
    OR?: DepartmentWhereInput[]
    NOT?: DepartmentWhereInput | DepartmentWhereInput[]
    name?: StringFilter<"Department"> | string
    createdAt?: DateTimeFilter<"Department"> | Date | string
    updatedAt?: DateTimeFilter<"Department"> | Date | string
    centerId?: StringFilter<"Department"> | string
    Center?: XOR<CenterScalarRelationFilter, CenterWhereInput>
    User?: UserListRelationFilter
  }, "id" | "name_centerId">

  export type DepartmentOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    centerId?: SortOrder
    _count?: DepartmentCountOrderByAggregateInput
    _max?: DepartmentMaxOrderByAggregateInput
    _min?: DepartmentMinOrderByAggregateInput
  }

  export type DepartmentScalarWhereWithAggregatesInput = {
    AND?: DepartmentScalarWhereWithAggregatesInput | DepartmentScalarWhereWithAggregatesInput[]
    OR?: DepartmentScalarWhereWithAggregatesInput[]
    NOT?: DepartmentScalarWhereWithAggregatesInput | DepartmentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Department"> | string
    name?: StringWithAggregatesFilter<"Department"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Department"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Department"> | Date | string
    centerId?: StringWithAggregatesFilter<"Department"> | string
  }

  export type SupervisedStudentWhereInput = {
    AND?: SupervisedStudentWhereInput | SupervisedStudentWhereInput[]
    OR?: SupervisedStudentWhereInput[]
    NOT?: SupervisedStudentWhereInput | SupervisedStudentWhereInput[]
    id?: StringFilter<"SupervisedStudent"> | string
    studentName?: StringFilter<"SupervisedStudent"> | string
    thesisTitle?: StringFilter<"SupervisedStudent"> | string
    claimId?: StringFilter<"SupervisedStudent"> | string
    supervisorId?: StringFilter<"SupervisedStudent"> | string
    Claim?: XOR<ClaimScalarRelationFilter, ClaimWhereInput>
    User?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type SupervisedStudentOrderByWithRelationInput = {
    id?: SortOrder
    studentName?: SortOrder
    thesisTitle?: SortOrder
    claimId?: SortOrder
    supervisorId?: SortOrder
    Claim?: ClaimOrderByWithRelationInput
    User?: UserOrderByWithRelationInput
    _relevance?: SupervisedStudentOrderByRelevanceInput
  }

  export type SupervisedStudentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SupervisedStudentWhereInput | SupervisedStudentWhereInput[]
    OR?: SupervisedStudentWhereInput[]
    NOT?: SupervisedStudentWhereInput | SupervisedStudentWhereInput[]
    studentName?: StringFilter<"SupervisedStudent"> | string
    thesisTitle?: StringFilter<"SupervisedStudent"> | string
    claimId?: StringFilter<"SupervisedStudent"> | string
    supervisorId?: StringFilter<"SupervisedStudent"> | string
    Claim?: XOR<ClaimScalarRelationFilter, ClaimWhereInput>
    User?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type SupervisedStudentOrderByWithAggregationInput = {
    id?: SortOrder
    studentName?: SortOrder
    thesisTitle?: SortOrder
    claimId?: SortOrder
    supervisorId?: SortOrder
    _count?: SupervisedStudentCountOrderByAggregateInput
    _max?: SupervisedStudentMaxOrderByAggregateInput
    _min?: SupervisedStudentMinOrderByAggregateInput
  }

  export type SupervisedStudentScalarWhereWithAggregatesInput = {
    AND?: SupervisedStudentScalarWhereWithAggregatesInput | SupervisedStudentScalarWhereWithAggregatesInput[]
    OR?: SupervisedStudentScalarWhereWithAggregatesInput[]
    NOT?: SupervisedStudentScalarWhereWithAggregatesInput | SupervisedStudentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SupervisedStudent"> | string
    studentName?: StringWithAggregatesFilter<"SupervisedStudent"> | string
    thesisTitle?: StringWithAggregatesFilter<"SupervisedStudent"> | string
    claimId?: StringWithAggregatesFilter<"SupervisedStudent"> | string
    supervisorId?: StringWithAggregatesFilter<"SupervisedStudent"> | string
  }

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    name?: StringNullableFilter<"User"> | string | null
    password?: StringFilter<"User"> | string
    role?: EnumUser_roleFilter<"User"> | $Enums.User_role
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    lecturerCenterId?: StringNullableFilter<"User"> | string | null
    departmentId?: StringNullableFilter<"User"> | string | null
    Center_Center_coordinatorIdToUser?: XOR<CenterNullableScalarRelationFilter, CenterWhereInput> | null
    Claim_Claim_processedByIdToUser?: ClaimListRelationFilter
    Claim_Claim_submittedByIdToUser?: ClaimListRelationFilter
    SupervisedStudent?: SupervisedStudentListRelationFilter
    Department?: XOR<DepartmentNullableScalarRelationFilter, DepartmentWhereInput> | null
    Center_User_lecturerCenterIdToCenter?: XOR<CenterNullableScalarRelationFilter, CenterWhereInput> | null
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrderInput | SortOrder
    password?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lecturerCenterId?: SortOrderInput | SortOrder
    departmentId?: SortOrderInput | SortOrder
    Center_Center_coordinatorIdToUser?: CenterOrderByWithRelationInput
    Claim_Claim_processedByIdToUser?: ClaimOrderByRelationAggregateInput
    Claim_Claim_submittedByIdToUser?: ClaimOrderByRelationAggregateInput
    SupervisedStudent?: SupervisedStudentOrderByRelationAggregateInput
    Department?: DepartmentOrderByWithRelationInput
    Center_User_lecturerCenterIdToCenter?: CenterOrderByWithRelationInput
    _relevance?: UserOrderByRelevanceInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringNullableFilter<"User"> | string | null
    password?: StringFilter<"User"> | string
    role?: EnumUser_roleFilter<"User"> | $Enums.User_role
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    lecturerCenterId?: StringNullableFilter<"User"> | string | null
    departmentId?: StringNullableFilter<"User"> | string | null
    Center_Center_coordinatorIdToUser?: XOR<CenterNullableScalarRelationFilter, CenterWhereInput> | null
    Claim_Claim_processedByIdToUser?: ClaimListRelationFilter
    Claim_Claim_submittedByIdToUser?: ClaimListRelationFilter
    SupervisedStudent?: SupervisedStudentListRelationFilter
    Department?: XOR<DepartmentNullableScalarRelationFilter, DepartmentWhereInput> | null
    Center_User_lecturerCenterIdToCenter?: XOR<CenterNullableScalarRelationFilter, CenterWhereInput> | null
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrderInput | SortOrder
    password?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lecturerCenterId?: SortOrderInput | SortOrder
    departmentId?: SortOrderInput | SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    name?: StringNullableWithAggregatesFilter<"User"> | string | null
    password?: StringWithAggregatesFilter<"User"> | string
    role?: EnumUser_roleWithAggregatesFilter<"User"> | $Enums.User_role
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    lecturerCenterId?: StringNullableWithAggregatesFilter<"User"> | string | null
    departmentId?: StringNullableWithAggregatesFilter<"User"> | string | null
  }

  export type CenterCreateInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt: Date | string
    User_Center_coordinatorIdToUser: UserCreateNestedOneWithoutCenter_Center_coordinatorIdToUserInput
    Claim?: ClaimCreateNestedManyWithoutCenterInput
    Department?: DepartmentCreateNestedManyWithoutCenterInput
    User_User_lecturerCenterIdToCenter?: UserCreateNestedManyWithoutCenter_User_lecturerCenterIdToCenterInput
  }

  export type CenterUncheckedCreateInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt: Date | string
    coordinatorId: string
    Claim?: ClaimUncheckedCreateNestedManyWithoutCenterInput
    Department?: DepartmentUncheckedCreateNestedManyWithoutCenterInput
    User_User_lecturerCenterIdToCenter?: UserUncheckedCreateNestedManyWithoutCenter_User_lecturerCenterIdToCenterInput
  }

  export type CenterUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    User_Center_coordinatorIdToUser?: UserUpdateOneRequiredWithoutCenter_Center_coordinatorIdToUserNestedInput
    Claim?: ClaimUpdateManyWithoutCenterNestedInput
    Department?: DepartmentUpdateManyWithoutCenterNestedInput
    User_User_lecturerCenterIdToCenter?: UserUpdateManyWithoutCenter_User_lecturerCenterIdToCenterNestedInput
  }

  export type CenterUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    coordinatorId?: StringFieldUpdateOperationsInput | string
    Claim?: ClaimUncheckedUpdateManyWithoutCenterNestedInput
    Department?: DepartmentUncheckedUpdateManyWithoutCenterNestedInput
    User_User_lecturerCenterIdToCenter?: UserUncheckedUpdateManyWithoutCenter_User_lecturerCenterIdToCenterNestedInput
  }

  export type CenterCreateManyInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt: Date | string
    coordinatorId: string
  }

  export type CenterUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CenterUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    coordinatorId?: StringFieldUpdateOperationsInput | string
  }

  export type ClaimCreateInput = {
    id: string
    claimType: $Enums.Claim_claimType
    status?: $Enums.Claim_status
    submittedAt?: Date | string
    updatedAt: Date | string
    processedAt?: Date | string | null
    teachingDate?: Date | string | null
    teachingStartTime?: string | null
    teachingEndTime?: string | null
    teachingHours?: number | null
    transportType?: $Enums.Claim_transportType | null
    transportDestinationTo?: string | null
    transportDestinationFrom?: string | null
    transportRegNumber?: string | null
    transportCubicCapacity?: number | null
    transportAmount?: number | null
    thesisType?: $Enums.Claim_thesisType | null
    thesisSupervisionRank?: $Enums.Claim_thesisSupervisionRank | null
    thesisExamCourseCode?: string | null
    thesisExamDate?: Date | string | null
    Center: CenterCreateNestedOneWithoutClaimInput
    User_Claim_processedByIdToUser?: UserCreateNestedOneWithoutClaim_Claim_processedByIdToUserInput
    User_Claim_submittedByIdToUser: UserCreateNestedOneWithoutClaim_Claim_submittedByIdToUserInput
    SupervisedStudent?: SupervisedStudentCreateNestedManyWithoutClaimInput
  }

  export type ClaimUncheckedCreateInput = {
    id: string
    claimType: $Enums.Claim_claimType
    status?: $Enums.Claim_status
    submittedAt?: Date | string
    updatedAt: Date | string
    processedAt?: Date | string | null
    submittedById: string
    centerId: string
    processedById?: string | null
    teachingDate?: Date | string | null
    teachingStartTime?: string | null
    teachingEndTime?: string | null
    teachingHours?: number | null
    transportType?: $Enums.Claim_transportType | null
    transportDestinationTo?: string | null
    transportDestinationFrom?: string | null
    transportRegNumber?: string | null
    transportCubicCapacity?: number | null
    transportAmount?: number | null
    thesisType?: $Enums.Claim_thesisType | null
    thesisSupervisionRank?: $Enums.Claim_thesisSupervisionRank | null
    thesisExamCourseCode?: string | null
    thesisExamDate?: Date | string | null
    SupervisedStudent?: SupervisedStudentUncheckedCreateNestedManyWithoutClaimInput
  }

  export type ClaimUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    claimType?: EnumClaim_claimTypeFieldUpdateOperationsInput | $Enums.Claim_claimType
    status?: EnumClaim_statusFieldUpdateOperationsInput | $Enums.Claim_status
    submittedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    teachingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    teachingStartTime?: NullableStringFieldUpdateOperationsInput | string | null
    teachingEndTime?: NullableStringFieldUpdateOperationsInput | string | null
    teachingHours?: NullableFloatFieldUpdateOperationsInput | number | null
    transportType?: NullableEnumClaim_transportTypeFieldUpdateOperationsInput | $Enums.Claim_transportType | null
    transportDestinationTo?: NullableStringFieldUpdateOperationsInput | string | null
    transportDestinationFrom?: NullableStringFieldUpdateOperationsInput | string | null
    transportRegNumber?: NullableStringFieldUpdateOperationsInput | string | null
    transportCubicCapacity?: NullableIntFieldUpdateOperationsInput | number | null
    transportAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    thesisType?: NullableEnumClaim_thesisTypeFieldUpdateOperationsInput | $Enums.Claim_thesisType | null
    thesisSupervisionRank?: NullableEnumClaim_thesisSupervisionRankFieldUpdateOperationsInput | $Enums.Claim_thesisSupervisionRank | null
    thesisExamCourseCode?: NullableStringFieldUpdateOperationsInput | string | null
    thesisExamDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Center?: CenterUpdateOneRequiredWithoutClaimNestedInput
    User_Claim_processedByIdToUser?: UserUpdateOneWithoutClaim_Claim_processedByIdToUserNestedInput
    User_Claim_submittedByIdToUser?: UserUpdateOneRequiredWithoutClaim_Claim_submittedByIdToUserNestedInput
    SupervisedStudent?: SupervisedStudentUpdateManyWithoutClaimNestedInput
  }

  export type ClaimUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    claimType?: EnumClaim_claimTypeFieldUpdateOperationsInput | $Enums.Claim_claimType
    status?: EnumClaim_statusFieldUpdateOperationsInput | $Enums.Claim_status
    submittedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    submittedById?: StringFieldUpdateOperationsInput | string
    centerId?: StringFieldUpdateOperationsInput | string
    processedById?: NullableStringFieldUpdateOperationsInput | string | null
    teachingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    teachingStartTime?: NullableStringFieldUpdateOperationsInput | string | null
    teachingEndTime?: NullableStringFieldUpdateOperationsInput | string | null
    teachingHours?: NullableFloatFieldUpdateOperationsInput | number | null
    transportType?: NullableEnumClaim_transportTypeFieldUpdateOperationsInput | $Enums.Claim_transportType | null
    transportDestinationTo?: NullableStringFieldUpdateOperationsInput | string | null
    transportDestinationFrom?: NullableStringFieldUpdateOperationsInput | string | null
    transportRegNumber?: NullableStringFieldUpdateOperationsInput | string | null
    transportCubicCapacity?: NullableIntFieldUpdateOperationsInput | number | null
    transportAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    thesisType?: NullableEnumClaim_thesisTypeFieldUpdateOperationsInput | $Enums.Claim_thesisType | null
    thesisSupervisionRank?: NullableEnumClaim_thesisSupervisionRankFieldUpdateOperationsInput | $Enums.Claim_thesisSupervisionRank | null
    thesisExamCourseCode?: NullableStringFieldUpdateOperationsInput | string | null
    thesisExamDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    SupervisedStudent?: SupervisedStudentUncheckedUpdateManyWithoutClaimNestedInput
  }

  export type ClaimCreateManyInput = {
    id: string
    claimType: $Enums.Claim_claimType
    status?: $Enums.Claim_status
    submittedAt?: Date | string
    updatedAt: Date | string
    processedAt?: Date | string | null
    submittedById: string
    centerId: string
    processedById?: string | null
    teachingDate?: Date | string | null
    teachingStartTime?: string | null
    teachingEndTime?: string | null
    teachingHours?: number | null
    transportType?: $Enums.Claim_transportType | null
    transportDestinationTo?: string | null
    transportDestinationFrom?: string | null
    transportRegNumber?: string | null
    transportCubicCapacity?: number | null
    transportAmount?: number | null
    thesisType?: $Enums.Claim_thesisType | null
    thesisSupervisionRank?: $Enums.Claim_thesisSupervisionRank | null
    thesisExamCourseCode?: string | null
    thesisExamDate?: Date | string | null
  }

  export type ClaimUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    claimType?: EnumClaim_claimTypeFieldUpdateOperationsInput | $Enums.Claim_claimType
    status?: EnumClaim_statusFieldUpdateOperationsInput | $Enums.Claim_status
    submittedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    teachingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    teachingStartTime?: NullableStringFieldUpdateOperationsInput | string | null
    teachingEndTime?: NullableStringFieldUpdateOperationsInput | string | null
    teachingHours?: NullableFloatFieldUpdateOperationsInput | number | null
    transportType?: NullableEnumClaim_transportTypeFieldUpdateOperationsInput | $Enums.Claim_transportType | null
    transportDestinationTo?: NullableStringFieldUpdateOperationsInput | string | null
    transportDestinationFrom?: NullableStringFieldUpdateOperationsInput | string | null
    transportRegNumber?: NullableStringFieldUpdateOperationsInput | string | null
    transportCubicCapacity?: NullableIntFieldUpdateOperationsInput | number | null
    transportAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    thesisType?: NullableEnumClaim_thesisTypeFieldUpdateOperationsInput | $Enums.Claim_thesisType | null
    thesisSupervisionRank?: NullableEnumClaim_thesisSupervisionRankFieldUpdateOperationsInput | $Enums.Claim_thesisSupervisionRank | null
    thesisExamCourseCode?: NullableStringFieldUpdateOperationsInput | string | null
    thesisExamDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ClaimUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    claimType?: EnumClaim_claimTypeFieldUpdateOperationsInput | $Enums.Claim_claimType
    status?: EnumClaim_statusFieldUpdateOperationsInput | $Enums.Claim_status
    submittedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    submittedById?: StringFieldUpdateOperationsInput | string
    centerId?: StringFieldUpdateOperationsInput | string
    processedById?: NullableStringFieldUpdateOperationsInput | string | null
    teachingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    teachingStartTime?: NullableStringFieldUpdateOperationsInput | string | null
    teachingEndTime?: NullableStringFieldUpdateOperationsInput | string | null
    teachingHours?: NullableFloatFieldUpdateOperationsInput | number | null
    transportType?: NullableEnumClaim_transportTypeFieldUpdateOperationsInput | $Enums.Claim_transportType | null
    transportDestinationTo?: NullableStringFieldUpdateOperationsInput | string | null
    transportDestinationFrom?: NullableStringFieldUpdateOperationsInput | string | null
    transportRegNumber?: NullableStringFieldUpdateOperationsInput | string | null
    transportCubicCapacity?: NullableIntFieldUpdateOperationsInput | number | null
    transportAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    thesisType?: NullableEnumClaim_thesisTypeFieldUpdateOperationsInput | $Enums.Claim_thesisType | null
    thesisSupervisionRank?: NullableEnumClaim_thesisSupervisionRankFieldUpdateOperationsInput | $Enums.Claim_thesisSupervisionRank | null
    thesisExamCourseCode?: NullableStringFieldUpdateOperationsInput | string | null
    thesisExamDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DepartmentCreateInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt: Date | string
    Center: CenterCreateNestedOneWithoutDepartmentInput
    User?: UserCreateNestedManyWithoutDepartmentInput
  }

  export type DepartmentUncheckedCreateInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt: Date | string
    centerId: string
    User?: UserUncheckedCreateNestedManyWithoutDepartmentInput
  }

  export type DepartmentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Center?: CenterUpdateOneRequiredWithoutDepartmentNestedInput
    User?: UserUpdateManyWithoutDepartmentNestedInput
  }

  export type DepartmentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    centerId?: StringFieldUpdateOperationsInput | string
    User?: UserUncheckedUpdateManyWithoutDepartmentNestedInput
  }

  export type DepartmentCreateManyInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt: Date | string
    centerId: string
  }

  export type DepartmentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DepartmentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    centerId?: StringFieldUpdateOperationsInput | string
  }

  export type SupervisedStudentCreateInput = {
    id: string
    studentName: string
    thesisTitle: string
    Claim: ClaimCreateNestedOneWithoutSupervisedStudentInput
    User: UserCreateNestedOneWithoutSupervisedStudentInput
  }

  export type SupervisedStudentUncheckedCreateInput = {
    id: string
    studentName: string
    thesisTitle: string
    claimId: string
    supervisorId: string
  }

  export type SupervisedStudentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    studentName?: StringFieldUpdateOperationsInput | string
    thesisTitle?: StringFieldUpdateOperationsInput | string
    Claim?: ClaimUpdateOneRequiredWithoutSupervisedStudentNestedInput
    User?: UserUpdateOneRequiredWithoutSupervisedStudentNestedInput
  }

  export type SupervisedStudentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    studentName?: StringFieldUpdateOperationsInput | string
    thesisTitle?: StringFieldUpdateOperationsInput | string
    claimId?: StringFieldUpdateOperationsInput | string
    supervisorId?: StringFieldUpdateOperationsInput | string
  }

  export type SupervisedStudentCreateManyInput = {
    id: string
    studentName: string
    thesisTitle: string
    claimId: string
    supervisorId: string
  }

  export type SupervisedStudentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    studentName?: StringFieldUpdateOperationsInput | string
    thesisTitle?: StringFieldUpdateOperationsInput | string
  }

  export type SupervisedStudentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    studentName?: StringFieldUpdateOperationsInput | string
    thesisTitle?: StringFieldUpdateOperationsInput | string
    claimId?: StringFieldUpdateOperationsInput | string
    supervisorId?: StringFieldUpdateOperationsInput | string
  }

  export type UserCreateInput = {
    id: string
    email: string
    name?: string | null
    password: string
    role: $Enums.User_role
    createdAt?: Date | string
    updatedAt: Date | string
    Center_Center_coordinatorIdToUser?: CenterCreateNestedOneWithoutUser_Center_coordinatorIdToUserInput
    Claim_Claim_processedByIdToUser?: ClaimCreateNestedManyWithoutUser_Claim_processedByIdToUserInput
    Claim_Claim_submittedByIdToUser?: ClaimCreateNestedManyWithoutUser_Claim_submittedByIdToUserInput
    SupervisedStudent?: SupervisedStudentCreateNestedManyWithoutUserInput
    Department?: DepartmentCreateNestedOneWithoutUserInput
    Center_User_lecturerCenterIdToCenter?: CenterCreateNestedOneWithoutUser_User_lecturerCenterIdToCenterInput
  }

  export type UserUncheckedCreateInput = {
    id: string
    email: string
    name?: string | null
    password: string
    role: $Enums.User_role
    createdAt?: Date | string
    updatedAt: Date | string
    lecturerCenterId?: string | null
    departmentId?: string | null
    Center_Center_coordinatorIdToUser?: CenterUncheckedCreateNestedOneWithoutUser_Center_coordinatorIdToUserInput
    Claim_Claim_processedByIdToUser?: ClaimUncheckedCreateNestedManyWithoutUser_Claim_processedByIdToUserInput
    Claim_Claim_submittedByIdToUser?: ClaimUncheckedCreateNestedManyWithoutUser_Claim_submittedByIdToUserInput
    SupervisedStudent?: SupervisedStudentUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUser_roleFieldUpdateOperationsInput | $Enums.User_role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Center_Center_coordinatorIdToUser?: CenterUpdateOneWithoutUser_Center_coordinatorIdToUserNestedInput
    Claim_Claim_processedByIdToUser?: ClaimUpdateManyWithoutUser_Claim_processedByIdToUserNestedInput
    Claim_Claim_submittedByIdToUser?: ClaimUpdateManyWithoutUser_Claim_submittedByIdToUserNestedInput
    SupervisedStudent?: SupervisedStudentUpdateManyWithoutUserNestedInput
    Department?: DepartmentUpdateOneWithoutUserNestedInput
    Center_User_lecturerCenterIdToCenter?: CenterUpdateOneWithoutUser_User_lecturerCenterIdToCenterNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUser_roleFieldUpdateOperationsInput | $Enums.User_role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lecturerCenterId?: NullableStringFieldUpdateOperationsInput | string | null
    departmentId?: NullableStringFieldUpdateOperationsInput | string | null
    Center_Center_coordinatorIdToUser?: CenterUncheckedUpdateOneWithoutUser_Center_coordinatorIdToUserNestedInput
    Claim_Claim_processedByIdToUser?: ClaimUncheckedUpdateManyWithoutUser_Claim_processedByIdToUserNestedInput
    Claim_Claim_submittedByIdToUser?: ClaimUncheckedUpdateManyWithoutUser_Claim_submittedByIdToUserNestedInput
    SupervisedStudent?: SupervisedStudentUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id: string
    email: string
    name?: string | null
    password: string
    role: $Enums.User_role
    createdAt?: Date | string
    updatedAt: Date | string
    lecturerCenterId?: string | null
    departmentId?: string | null
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUser_roleFieldUpdateOperationsInput | $Enums.User_role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUser_roleFieldUpdateOperationsInput | $Enums.User_role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lecturerCenterId?: NullableStringFieldUpdateOperationsInput | string | null
    departmentId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type ClaimListRelationFilter = {
    every?: ClaimWhereInput
    some?: ClaimWhereInput
    none?: ClaimWhereInput
  }

  export type DepartmentListRelationFilter = {
    every?: DepartmentWhereInput
    some?: DepartmentWhereInput
    none?: DepartmentWhereInput
  }

  export type UserListRelationFilter = {
    every?: UserWhereInput
    some?: UserWhereInput
    none?: UserWhereInput
  }

  export type ClaimOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type DepartmentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CenterOrderByRelevanceInput = {
    fields: CenterOrderByRelevanceFieldEnum | CenterOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type CenterCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    coordinatorId?: SortOrder
  }

  export type CenterMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    coordinatorId?: SortOrder
  }

  export type CenterMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    coordinatorId?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type EnumClaim_claimTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.Claim_claimType | EnumClaim_claimTypeFieldRefInput<$PrismaModel>
    in?: $Enums.Claim_claimType[]
    notIn?: $Enums.Claim_claimType[]
    not?: NestedEnumClaim_claimTypeFilter<$PrismaModel> | $Enums.Claim_claimType
  }

  export type EnumClaim_statusFilter<$PrismaModel = never> = {
    equals?: $Enums.Claim_status | EnumClaim_statusFieldRefInput<$PrismaModel>
    in?: $Enums.Claim_status[]
    notIn?: $Enums.Claim_status[]
    not?: NestedEnumClaim_statusFilter<$PrismaModel> | $Enums.Claim_status
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type EnumClaim_transportTypeNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.Claim_transportType | EnumClaim_transportTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.Claim_transportType[] | null
    notIn?: $Enums.Claim_transportType[] | null
    not?: NestedEnumClaim_transportTypeNullableFilter<$PrismaModel> | $Enums.Claim_transportType | null
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type EnumClaim_thesisTypeNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.Claim_thesisType | EnumClaim_thesisTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.Claim_thesisType[] | null
    notIn?: $Enums.Claim_thesisType[] | null
    not?: NestedEnumClaim_thesisTypeNullableFilter<$PrismaModel> | $Enums.Claim_thesisType | null
  }

  export type EnumClaim_thesisSupervisionRankNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.Claim_thesisSupervisionRank | EnumClaim_thesisSupervisionRankFieldRefInput<$PrismaModel> | null
    in?: $Enums.Claim_thesisSupervisionRank[] | null
    notIn?: $Enums.Claim_thesisSupervisionRank[] | null
    not?: NestedEnumClaim_thesisSupervisionRankNullableFilter<$PrismaModel> | $Enums.Claim_thesisSupervisionRank | null
  }

  export type CenterScalarRelationFilter = {
    is?: CenterWhereInput
    isNot?: CenterWhereInput
  }

  export type UserNullableScalarRelationFilter = {
    is?: UserWhereInput | null
    isNot?: UserWhereInput | null
  }

  export type SupervisedStudentListRelationFilter = {
    every?: SupervisedStudentWhereInput
    some?: SupervisedStudentWhereInput
    none?: SupervisedStudentWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type SupervisedStudentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ClaimOrderByRelevanceInput = {
    fields: ClaimOrderByRelevanceFieldEnum | ClaimOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type ClaimCountOrderByAggregateInput = {
    id?: SortOrder
    claimType?: SortOrder
    status?: SortOrder
    submittedAt?: SortOrder
    updatedAt?: SortOrder
    processedAt?: SortOrder
    submittedById?: SortOrder
    centerId?: SortOrder
    processedById?: SortOrder
    teachingDate?: SortOrder
    teachingStartTime?: SortOrder
    teachingEndTime?: SortOrder
    teachingHours?: SortOrder
    transportType?: SortOrder
    transportDestinationTo?: SortOrder
    transportDestinationFrom?: SortOrder
    transportRegNumber?: SortOrder
    transportCubicCapacity?: SortOrder
    transportAmount?: SortOrder
    thesisType?: SortOrder
    thesisSupervisionRank?: SortOrder
    thesisExamCourseCode?: SortOrder
    thesisExamDate?: SortOrder
  }

  export type ClaimAvgOrderByAggregateInput = {
    teachingHours?: SortOrder
    transportCubicCapacity?: SortOrder
    transportAmount?: SortOrder
  }

  export type ClaimMaxOrderByAggregateInput = {
    id?: SortOrder
    claimType?: SortOrder
    status?: SortOrder
    submittedAt?: SortOrder
    updatedAt?: SortOrder
    processedAt?: SortOrder
    submittedById?: SortOrder
    centerId?: SortOrder
    processedById?: SortOrder
    teachingDate?: SortOrder
    teachingStartTime?: SortOrder
    teachingEndTime?: SortOrder
    teachingHours?: SortOrder
    transportType?: SortOrder
    transportDestinationTo?: SortOrder
    transportDestinationFrom?: SortOrder
    transportRegNumber?: SortOrder
    transportCubicCapacity?: SortOrder
    transportAmount?: SortOrder
    thesisType?: SortOrder
    thesisSupervisionRank?: SortOrder
    thesisExamCourseCode?: SortOrder
    thesisExamDate?: SortOrder
  }

  export type ClaimMinOrderByAggregateInput = {
    id?: SortOrder
    claimType?: SortOrder
    status?: SortOrder
    submittedAt?: SortOrder
    updatedAt?: SortOrder
    processedAt?: SortOrder
    submittedById?: SortOrder
    centerId?: SortOrder
    processedById?: SortOrder
    teachingDate?: SortOrder
    teachingStartTime?: SortOrder
    teachingEndTime?: SortOrder
    teachingHours?: SortOrder
    transportType?: SortOrder
    transportDestinationTo?: SortOrder
    transportDestinationFrom?: SortOrder
    transportRegNumber?: SortOrder
    transportCubicCapacity?: SortOrder
    transportAmount?: SortOrder
    thesisType?: SortOrder
    thesisSupervisionRank?: SortOrder
    thesisExamCourseCode?: SortOrder
    thesisExamDate?: SortOrder
  }

  export type ClaimSumOrderByAggregateInput = {
    teachingHours?: SortOrder
    transportCubicCapacity?: SortOrder
    transportAmount?: SortOrder
  }

  export type EnumClaim_claimTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Claim_claimType | EnumClaim_claimTypeFieldRefInput<$PrismaModel>
    in?: $Enums.Claim_claimType[]
    notIn?: $Enums.Claim_claimType[]
    not?: NestedEnumClaim_claimTypeWithAggregatesFilter<$PrismaModel> | $Enums.Claim_claimType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumClaim_claimTypeFilter<$PrismaModel>
    _max?: NestedEnumClaim_claimTypeFilter<$PrismaModel>
  }

  export type EnumClaim_statusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Claim_status | EnumClaim_statusFieldRefInput<$PrismaModel>
    in?: $Enums.Claim_status[]
    notIn?: $Enums.Claim_status[]
    not?: NestedEnumClaim_statusWithAggregatesFilter<$PrismaModel> | $Enums.Claim_status
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumClaim_statusFilter<$PrismaModel>
    _max?: NestedEnumClaim_statusFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type EnumClaim_transportTypeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Claim_transportType | EnumClaim_transportTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.Claim_transportType[] | null
    notIn?: $Enums.Claim_transportType[] | null
    not?: NestedEnumClaim_transportTypeNullableWithAggregatesFilter<$PrismaModel> | $Enums.Claim_transportType | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumClaim_transportTypeNullableFilter<$PrismaModel>
    _max?: NestedEnumClaim_transportTypeNullableFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type EnumClaim_thesisTypeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Claim_thesisType | EnumClaim_thesisTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.Claim_thesisType[] | null
    notIn?: $Enums.Claim_thesisType[] | null
    not?: NestedEnumClaim_thesisTypeNullableWithAggregatesFilter<$PrismaModel> | $Enums.Claim_thesisType | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumClaim_thesisTypeNullableFilter<$PrismaModel>
    _max?: NestedEnumClaim_thesisTypeNullableFilter<$PrismaModel>
  }

  export type EnumClaim_thesisSupervisionRankNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Claim_thesisSupervisionRank | EnumClaim_thesisSupervisionRankFieldRefInput<$PrismaModel> | null
    in?: $Enums.Claim_thesisSupervisionRank[] | null
    notIn?: $Enums.Claim_thesisSupervisionRank[] | null
    not?: NestedEnumClaim_thesisSupervisionRankNullableWithAggregatesFilter<$PrismaModel> | $Enums.Claim_thesisSupervisionRank | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumClaim_thesisSupervisionRankNullableFilter<$PrismaModel>
    _max?: NestedEnumClaim_thesisSupervisionRankNullableFilter<$PrismaModel>
  }

  export type DepartmentOrderByRelevanceInput = {
    fields: DepartmentOrderByRelevanceFieldEnum | DepartmentOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type DepartmentNameCenterIdCompoundUniqueInput = {
    name: string
    centerId: string
  }

  export type DepartmentCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    centerId?: SortOrder
  }

  export type DepartmentMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    centerId?: SortOrder
  }

  export type DepartmentMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    centerId?: SortOrder
  }

  export type ClaimScalarRelationFilter = {
    is?: ClaimWhereInput
    isNot?: ClaimWhereInput
  }

  export type SupervisedStudentOrderByRelevanceInput = {
    fields: SupervisedStudentOrderByRelevanceFieldEnum | SupervisedStudentOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type SupervisedStudentCountOrderByAggregateInput = {
    id?: SortOrder
    studentName?: SortOrder
    thesisTitle?: SortOrder
    claimId?: SortOrder
    supervisorId?: SortOrder
  }

  export type SupervisedStudentMaxOrderByAggregateInput = {
    id?: SortOrder
    studentName?: SortOrder
    thesisTitle?: SortOrder
    claimId?: SortOrder
    supervisorId?: SortOrder
  }

  export type SupervisedStudentMinOrderByAggregateInput = {
    id?: SortOrder
    studentName?: SortOrder
    thesisTitle?: SortOrder
    claimId?: SortOrder
    supervisorId?: SortOrder
  }

  export type EnumUser_roleFilter<$PrismaModel = never> = {
    equals?: $Enums.User_role | EnumUser_roleFieldRefInput<$PrismaModel>
    in?: $Enums.User_role[]
    notIn?: $Enums.User_role[]
    not?: NestedEnumUser_roleFilter<$PrismaModel> | $Enums.User_role
  }

  export type CenterNullableScalarRelationFilter = {
    is?: CenterWhereInput | null
    isNot?: CenterWhereInput | null
  }

  export type DepartmentNullableScalarRelationFilter = {
    is?: DepartmentWhereInput | null
    isNot?: DepartmentWhereInput | null
  }

  export type UserOrderByRelevanceInput = {
    fields: UserOrderByRelevanceFieldEnum | UserOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    password?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lecturerCenterId?: SortOrder
    departmentId?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    password?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lecturerCenterId?: SortOrder
    departmentId?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    password?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lecturerCenterId?: SortOrder
    departmentId?: SortOrder
  }

  export type EnumUser_roleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.User_role | EnumUser_roleFieldRefInput<$PrismaModel>
    in?: $Enums.User_role[]
    notIn?: $Enums.User_role[]
    not?: NestedEnumUser_roleWithAggregatesFilter<$PrismaModel> | $Enums.User_role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUser_roleFilter<$PrismaModel>
    _max?: NestedEnumUser_roleFilter<$PrismaModel>
  }

  export type UserCreateNestedOneWithoutCenter_Center_coordinatorIdToUserInput = {
    create?: XOR<UserCreateWithoutCenter_Center_coordinatorIdToUserInput, UserUncheckedCreateWithoutCenter_Center_coordinatorIdToUserInput>
    connectOrCreate?: UserCreateOrConnectWithoutCenter_Center_coordinatorIdToUserInput
    connect?: UserWhereUniqueInput
  }

  export type ClaimCreateNestedManyWithoutCenterInput = {
    create?: XOR<ClaimCreateWithoutCenterInput, ClaimUncheckedCreateWithoutCenterInput> | ClaimCreateWithoutCenterInput[] | ClaimUncheckedCreateWithoutCenterInput[]
    connectOrCreate?: ClaimCreateOrConnectWithoutCenterInput | ClaimCreateOrConnectWithoutCenterInput[]
    createMany?: ClaimCreateManyCenterInputEnvelope
    connect?: ClaimWhereUniqueInput | ClaimWhereUniqueInput[]
  }

  export type DepartmentCreateNestedManyWithoutCenterInput = {
    create?: XOR<DepartmentCreateWithoutCenterInput, DepartmentUncheckedCreateWithoutCenterInput> | DepartmentCreateWithoutCenterInput[] | DepartmentUncheckedCreateWithoutCenterInput[]
    connectOrCreate?: DepartmentCreateOrConnectWithoutCenterInput | DepartmentCreateOrConnectWithoutCenterInput[]
    createMany?: DepartmentCreateManyCenterInputEnvelope
    connect?: DepartmentWhereUniqueInput | DepartmentWhereUniqueInput[]
  }

  export type UserCreateNestedManyWithoutCenter_User_lecturerCenterIdToCenterInput = {
    create?: XOR<UserCreateWithoutCenter_User_lecturerCenterIdToCenterInput, UserUncheckedCreateWithoutCenter_User_lecturerCenterIdToCenterInput> | UserCreateWithoutCenter_User_lecturerCenterIdToCenterInput[] | UserUncheckedCreateWithoutCenter_User_lecturerCenterIdToCenterInput[]
    connectOrCreate?: UserCreateOrConnectWithoutCenter_User_lecturerCenterIdToCenterInput | UserCreateOrConnectWithoutCenter_User_lecturerCenterIdToCenterInput[]
    createMany?: UserCreateManyCenter_User_lecturerCenterIdToCenterInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type ClaimUncheckedCreateNestedManyWithoutCenterInput = {
    create?: XOR<ClaimCreateWithoutCenterInput, ClaimUncheckedCreateWithoutCenterInput> | ClaimCreateWithoutCenterInput[] | ClaimUncheckedCreateWithoutCenterInput[]
    connectOrCreate?: ClaimCreateOrConnectWithoutCenterInput | ClaimCreateOrConnectWithoutCenterInput[]
    createMany?: ClaimCreateManyCenterInputEnvelope
    connect?: ClaimWhereUniqueInput | ClaimWhereUniqueInput[]
  }

  export type DepartmentUncheckedCreateNestedManyWithoutCenterInput = {
    create?: XOR<DepartmentCreateWithoutCenterInput, DepartmentUncheckedCreateWithoutCenterInput> | DepartmentCreateWithoutCenterInput[] | DepartmentUncheckedCreateWithoutCenterInput[]
    connectOrCreate?: DepartmentCreateOrConnectWithoutCenterInput | DepartmentCreateOrConnectWithoutCenterInput[]
    createMany?: DepartmentCreateManyCenterInputEnvelope
    connect?: DepartmentWhereUniqueInput | DepartmentWhereUniqueInput[]
  }

  export type UserUncheckedCreateNestedManyWithoutCenter_User_lecturerCenterIdToCenterInput = {
    create?: XOR<UserCreateWithoutCenter_User_lecturerCenterIdToCenterInput, UserUncheckedCreateWithoutCenter_User_lecturerCenterIdToCenterInput> | UserCreateWithoutCenter_User_lecturerCenterIdToCenterInput[] | UserUncheckedCreateWithoutCenter_User_lecturerCenterIdToCenterInput[]
    connectOrCreate?: UserCreateOrConnectWithoutCenter_User_lecturerCenterIdToCenterInput | UserCreateOrConnectWithoutCenter_User_lecturerCenterIdToCenterInput[]
    createMany?: UserCreateManyCenter_User_lecturerCenterIdToCenterInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type UserUpdateOneRequiredWithoutCenter_Center_coordinatorIdToUserNestedInput = {
    create?: XOR<UserCreateWithoutCenter_Center_coordinatorIdToUserInput, UserUncheckedCreateWithoutCenter_Center_coordinatorIdToUserInput>
    connectOrCreate?: UserCreateOrConnectWithoutCenter_Center_coordinatorIdToUserInput
    upsert?: UserUpsertWithoutCenter_Center_coordinatorIdToUserInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutCenter_Center_coordinatorIdToUserInput, UserUpdateWithoutCenter_Center_coordinatorIdToUserInput>, UserUncheckedUpdateWithoutCenter_Center_coordinatorIdToUserInput>
  }

  export type ClaimUpdateManyWithoutCenterNestedInput = {
    create?: XOR<ClaimCreateWithoutCenterInput, ClaimUncheckedCreateWithoutCenterInput> | ClaimCreateWithoutCenterInput[] | ClaimUncheckedCreateWithoutCenterInput[]
    connectOrCreate?: ClaimCreateOrConnectWithoutCenterInput | ClaimCreateOrConnectWithoutCenterInput[]
    upsert?: ClaimUpsertWithWhereUniqueWithoutCenterInput | ClaimUpsertWithWhereUniqueWithoutCenterInput[]
    createMany?: ClaimCreateManyCenterInputEnvelope
    set?: ClaimWhereUniqueInput | ClaimWhereUniqueInput[]
    disconnect?: ClaimWhereUniqueInput | ClaimWhereUniqueInput[]
    delete?: ClaimWhereUniqueInput | ClaimWhereUniqueInput[]
    connect?: ClaimWhereUniqueInput | ClaimWhereUniqueInput[]
    update?: ClaimUpdateWithWhereUniqueWithoutCenterInput | ClaimUpdateWithWhereUniqueWithoutCenterInput[]
    updateMany?: ClaimUpdateManyWithWhereWithoutCenterInput | ClaimUpdateManyWithWhereWithoutCenterInput[]
    deleteMany?: ClaimScalarWhereInput | ClaimScalarWhereInput[]
  }

  export type DepartmentUpdateManyWithoutCenterNestedInput = {
    create?: XOR<DepartmentCreateWithoutCenterInput, DepartmentUncheckedCreateWithoutCenterInput> | DepartmentCreateWithoutCenterInput[] | DepartmentUncheckedCreateWithoutCenterInput[]
    connectOrCreate?: DepartmentCreateOrConnectWithoutCenterInput | DepartmentCreateOrConnectWithoutCenterInput[]
    upsert?: DepartmentUpsertWithWhereUniqueWithoutCenterInput | DepartmentUpsertWithWhereUniqueWithoutCenterInput[]
    createMany?: DepartmentCreateManyCenterInputEnvelope
    set?: DepartmentWhereUniqueInput | DepartmentWhereUniqueInput[]
    disconnect?: DepartmentWhereUniqueInput | DepartmentWhereUniqueInput[]
    delete?: DepartmentWhereUniqueInput | DepartmentWhereUniqueInput[]
    connect?: DepartmentWhereUniqueInput | DepartmentWhereUniqueInput[]
    update?: DepartmentUpdateWithWhereUniqueWithoutCenterInput | DepartmentUpdateWithWhereUniqueWithoutCenterInput[]
    updateMany?: DepartmentUpdateManyWithWhereWithoutCenterInput | DepartmentUpdateManyWithWhereWithoutCenterInput[]
    deleteMany?: DepartmentScalarWhereInput | DepartmentScalarWhereInput[]
  }

  export type UserUpdateManyWithoutCenter_User_lecturerCenterIdToCenterNestedInput = {
    create?: XOR<UserCreateWithoutCenter_User_lecturerCenterIdToCenterInput, UserUncheckedCreateWithoutCenter_User_lecturerCenterIdToCenterInput> | UserCreateWithoutCenter_User_lecturerCenterIdToCenterInput[] | UserUncheckedCreateWithoutCenter_User_lecturerCenterIdToCenterInput[]
    connectOrCreate?: UserCreateOrConnectWithoutCenter_User_lecturerCenterIdToCenterInput | UserCreateOrConnectWithoutCenter_User_lecturerCenterIdToCenterInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutCenter_User_lecturerCenterIdToCenterInput | UserUpsertWithWhereUniqueWithoutCenter_User_lecturerCenterIdToCenterInput[]
    createMany?: UserCreateManyCenter_User_lecturerCenterIdToCenterInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutCenter_User_lecturerCenterIdToCenterInput | UserUpdateWithWhereUniqueWithoutCenter_User_lecturerCenterIdToCenterInput[]
    updateMany?: UserUpdateManyWithWhereWithoutCenter_User_lecturerCenterIdToCenterInput | UserUpdateManyWithWhereWithoutCenter_User_lecturerCenterIdToCenterInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type ClaimUncheckedUpdateManyWithoutCenterNestedInput = {
    create?: XOR<ClaimCreateWithoutCenterInput, ClaimUncheckedCreateWithoutCenterInput> | ClaimCreateWithoutCenterInput[] | ClaimUncheckedCreateWithoutCenterInput[]
    connectOrCreate?: ClaimCreateOrConnectWithoutCenterInput | ClaimCreateOrConnectWithoutCenterInput[]
    upsert?: ClaimUpsertWithWhereUniqueWithoutCenterInput | ClaimUpsertWithWhereUniqueWithoutCenterInput[]
    createMany?: ClaimCreateManyCenterInputEnvelope
    set?: ClaimWhereUniqueInput | ClaimWhereUniqueInput[]
    disconnect?: ClaimWhereUniqueInput | ClaimWhereUniqueInput[]
    delete?: ClaimWhereUniqueInput | ClaimWhereUniqueInput[]
    connect?: ClaimWhereUniqueInput | ClaimWhereUniqueInput[]
    update?: ClaimUpdateWithWhereUniqueWithoutCenterInput | ClaimUpdateWithWhereUniqueWithoutCenterInput[]
    updateMany?: ClaimUpdateManyWithWhereWithoutCenterInput | ClaimUpdateManyWithWhereWithoutCenterInput[]
    deleteMany?: ClaimScalarWhereInput | ClaimScalarWhereInput[]
  }

  export type DepartmentUncheckedUpdateManyWithoutCenterNestedInput = {
    create?: XOR<DepartmentCreateWithoutCenterInput, DepartmentUncheckedCreateWithoutCenterInput> | DepartmentCreateWithoutCenterInput[] | DepartmentUncheckedCreateWithoutCenterInput[]
    connectOrCreate?: DepartmentCreateOrConnectWithoutCenterInput | DepartmentCreateOrConnectWithoutCenterInput[]
    upsert?: DepartmentUpsertWithWhereUniqueWithoutCenterInput | DepartmentUpsertWithWhereUniqueWithoutCenterInput[]
    createMany?: DepartmentCreateManyCenterInputEnvelope
    set?: DepartmentWhereUniqueInput | DepartmentWhereUniqueInput[]
    disconnect?: DepartmentWhereUniqueInput | DepartmentWhereUniqueInput[]
    delete?: DepartmentWhereUniqueInput | DepartmentWhereUniqueInput[]
    connect?: DepartmentWhereUniqueInput | DepartmentWhereUniqueInput[]
    update?: DepartmentUpdateWithWhereUniqueWithoutCenterInput | DepartmentUpdateWithWhereUniqueWithoutCenterInput[]
    updateMany?: DepartmentUpdateManyWithWhereWithoutCenterInput | DepartmentUpdateManyWithWhereWithoutCenterInput[]
    deleteMany?: DepartmentScalarWhereInput | DepartmentScalarWhereInput[]
  }

  export type UserUncheckedUpdateManyWithoutCenter_User_lecturerCenterIdToCenterNestedInput = {
    create?: XOR<UserCreateWithoutCenter_User_lecturerCenterIdToCenterInput, UserUncheckedCreateWithoutCenter_User_lecturerCenterIdToCenterInput> | UserCreateWithoutCenter_User_lecturerCenterIdToCenterInput[] | UserUncheckedCreateWithoutCenter_User_lecturerCenterIdToCenterInput[]
    connectOrCreate?: UserCreateOrConnectWithoutCenter_User_lecturerCenterIdToCenterInput | UserCreateOrConnectWithoutCenter_User_lecturerCenterIdToCenterInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutCenter_User_lecturerCenterIdToCenterInput | UserUpsertWithWhereUniqueWithoutCenter_User_lecturerCenterIdToCenterInput[]
    createMany?: UserCreateManyCenter_User_lecturerCenterIdToCenterInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutCenter_User_lecturerCenterIdToCenterInput | UserUpdateWithWhereUniqueWithoutCenter_User_lecturerCenterIdToCenterInput[]
    updateMany?: UserUpdateManyWithWhereWithoutCenter_User_lecturerCenterIdToCenterInput | UserUpdateManyWithWhereWithoutCenter_User_lecturerCenterIdToCenterInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type CenterCreateNestedOneWithoutClaimInput = {
    create?: XOR<CenterCreateWithoutClaimInput, CenterUncheckedCreateWithoutClaimInput>
    connectOrCreate?: CenterCreateOrConnectWithoutClaimInput
    connect?: CenterWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutClaim_Claim_processedByIdToUserInput = {
    create?: XOR<UserCreateWithoutClaim_Claim_processedByIdToUserInput, UserUncheckedCreateWithoutClaim_Claim_processedByIdToUserInput>
    connectOrCreate?: UserCreateOrConnectWithoutClaim_Claim_processedByIdToUserInput
    connect?: UserWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutClaim_Claim_submittedByIdToUserInput = {
    create?: XOR<UserCreateWithoutClaim_Claim_submittedByIdToUserInput, UserUncheckedCreateWithoutClaim_Claim_submittedByIdToUserInput>
    connectOrCreate?: UserCreateOrConnectWithoutClaim_Claim_submittedByIdToUserInput
    connect?: UserWhereUniqueInput
  }

  export type SupervisedStudentCreateNestedManyWithoutClaimInput = {
    create?: XOR<SupervisedStudentCreateWithoutClaimInput, SupervisedStudentUncheckedCreateWithoutClaimInput> | SupervisedStudentCreateWithoutClaimInput[] | SupervisedStudentUncheckedCreateWithoutClaimInput[]
    connectOrCreate?: SupervisedStudentCreateOrConnectWithoutClaimInput | SupervisedStudentCreateOrConnectWithoutClaimInput[]
    createMany?: SupervisedStudentCreateManyClaimInputEnvelope
    connect?: SupervisedStudentWhereUniqueInput | SupervisedStudentWhereUniqueInput[]
  }

  export type SupervisedStudentUncheckedCreateNestedManyWithoutClaimInput = {
    create?: XOR<SupervisedStudentCreateWithoutClaimInput, SupervisedStudentUncheckedCreateWithoutClaimInput> | SupervisedStudentCreateWithoutClaimInput[] | SupervisedStudentUncheckedCreateWithoutClaimInput[]
    connectOrCreate?: SupervisedStudentCreateOrConnectWithoutClaimInput | SupervisedStudentCreateOrConnectWithoutClaimInput[]
    createMany?: SupervisedStudentCreateManyClaimInputEnvelope
    connect?: SupervisedStudentWhereUniqueInput | SupervisedStudentWhereUniqueInput[]
  }

  export type EnumClaim_claimTypeFieldUpdateOperationsInput = {
    set?: $Enums.Claim_claimType
  }

  export type EnumClaim_statusFieldUpdateOperationsInput = {
    set?: $Enums.Claim_status
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableEnumClaim_transportTypeFieldUpdateOperationsInput = {
    set?: $Enums.Claim_transportType | null
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableEnumClaim_thesisTypeFieldUpdateOperationsInput = {
    set?: $Enums.Claim_thesisType | null
  }

  export type NullableEnumClaim_thesisSupervisionRankFieldUpdateOperationsInput = {
    set?: $Enums.Claim_thesisSupervisionRank | null
  }

  export type CenterUpdateOneRequiredWithoutClaimNestedInput = {
    create?: XOR<CenterCreateWithoutClaimInput, CenterUncheckedCreateWithoutClaimInput>
    connectOrCreate?: CenterCreateOrConnectWithoutClaimInput
    upsert?: CenterUpsertWithoutClaimInput
    connect?: CenterWhereUniqueInput
    update?: XOR<XOR<CenterUpdateToOneWithWhereWithoutClaimInput, CenterUpdateWithoutClaimInput>, CenterUncheckedUpdateWithoutClaimInput>
  }

  export type UserUpdateOneWithoutClaim_Claim_processedByIdToUserNestedInput = {
    create?: XOR<UserCreateWithoutClaim_Claim_processedByIdToUserInput, UserUncheckedCreateWithoutClaim_Claim_processedByIdToUserInput>
    connectOrCreate?: UserCreateOrConnectWithoutClaim_Claim_processedByIdToUserInput
    upsert?: UserUpsertWithoutClaim_Claim_processedByIdToUserInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutClaim_Claim_processedByIdToUserInput, UserUpdateWithoutClaim_Claim_processedByIdToUserInput>, UserUncheckedUpdateWithoutClaim_Claim_processedByIdToUserInput>
  }

  export type UserUpdateOneRequiredWithoutClaim_Claim_submittedByIdToUserNestedInput = {
    create?: XOR<UserCreateWithoutClaim_Claim_submittedByIdToUserInput, UserUncheckedCreateWithoutClaim_Claim_submittedByIdToUserInput>
    connectOrCreate?: UserCreateOrConnectWithoutClaim_Claim_submittedByIdToUserInput
    upsert?: UserUpsertWithoutClaim_Claim_submittedByIdToUserInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutClaim_Claim_submittedByIdToUserInput, UserUpdateWithoutClaim_Claim_submittedByIdToUserInput>, UserUncheckedUpdateWithoutClaim_Claim_submittedByIdToUserInput>
  }

  export type SupervisedStudentUpdateManyWithoutClaimNestedInput = {
    create?: XOR<SupervisedStudentCreateWithoutClaimInput, SupervisedStudentUncheckedCreateWithoutClaimInput> | SupervisedStudentCreateWithoutClaimInput[] | SupervisedStudentUncheckedCreateWithoutClaimInput[]
    connectOrCreate?: SupervisedStudentCreateOrConnectWithoutClaimInput | SupervisedStudentCreateOrConnectWithoutClaimInput[]
    upsert?: SupervisedStudentUpsertWithWhereUniqueWithoutClaimInput | SupervisedStudentUpsertWithWhereUniqueWithoutClaimInput[]
    createMany?: SupervisedStudentCreateManyClaimInputEnvelope
    set?: SupervisedStudentWhereUniqueInput | SupervisedStudentWhereUniqueInput[]
    disconnect?: SupervisedStudentWhereUniqueInput | SupervisedStudentWhereUniqueInput[]
    delete?: SupervisedStudentWhereUniqueInput | SupervisedStudentWhereUniqueInput[]
    connect?: SupervisedStudentWhereUniqueInput | SupervisedStudentWhereUniqueInput[]
    update?: SupervisedStudentUpdateWithWhereUniqueWithoutClaimInput | SupervisedStudentUpdateWithWhereUniqueWithoutClaimInput[]
    updateMany?: SupervisedStudentUpdateManyWithWhereWithoutClaimInput | SupervisedStudentUpdateManyWithWhereWithoutClaimInput[]
    deleteMany?: SupervisedStudentScalarWhereInput | SupervisedStudentScalarWhereInput[]
  }

  export type SupervisedStudentUncheckedUpdateManyWithoutClaimNestedInput = {
    create?: XOR<SupervisedStudentCreateWithoutClaimInput, SupervisedStudentUncheckedCreateWithoutClaimInput> | SupervisedStudentCreateWithoutClaimInput[] | SupervisedStudentUncheckedCreateWithoutClaimInput[]
    connectOrCreate?: SupervisedStudentCreateOrConnectWithoutClaimInput | SupervisedStudentCreateOrConnectWithoutClaimInput[]
    upsert?: SupervisedStudentUpsertWithWhereUniqueWithoutClaimInput | SupervisedStudentUpsertWithWhereUniqueWithoutClaimInput[]
    createMany?: SupervisedStudentCreateManyClaimInputEnvelope
    set?: SupervisedStudentWhereUniqueInput | SupervisedStudentWhereUniqueInput[]
    disconnect?: SupervisedStudentWhereUniqueInput | SupervisedStudentWhereUniqueInput[]
    delete?: SupervisedStudentWhereUniqueInput | SupervisedStudentWhereUniqueInput[]
    connect?: SupervisedStudentWhereUniqueInput | SupervisedStudentWhereUniqueInput[]
    update?: SupervisedStudentUpdateWithWhereUniqueWithoutClaimInput | SupervisedStudentUpdateWithWhereUniqueWithoutClaimInput[]
    updateMany?: SupervisedStudentUpdateManyWithWhereWithoutClaimInput | SupervisedStudentUpdateManyWithWhereWithoutClaimInput[]
    deleteMany?: SupervisedStudentScalarWhereInput | SupervisedStudentScalarWhereInput[]
  }

  export type CenterCreateNestedOneWithoutDepartmentInput = {
    create?: XOR<CenterCreateWithoutDepartmentInput, CenterUncheckedCreateWithoutDepartmentInput>
    connectOrCreate?: CenterCreateOrConnectWithoutDepartmentInput
    connect?: CenterWhereUniqueInput
  }

  export type UserCreateNestedManyWithoutDepartmentInput = {
    create?: XOR<UserCreateWithoutDepartmentInput, UserUncheckedCreateWithoutDepartmentInput> | UserCreateWithoutDepartmentInput[] | UserUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: UserCreateOrConnectWithoutDepartmentInput | UserCreateOrConnectWithoutDepartmentInput[]
    createMany?: UserCreateManyDepartmentInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type UserUncheckedCreateNestedManyWithoutDepartmentInput = {
    create?: XOR<UserCreateWithoutDepartmentInput, UserUncheckedCreateWithoutDepartmentInput> | UserCreateWithoutDepartmentInput[] | UserUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: UserCreateOrConnectWithoutDepartmentInput | UserCreateOrConnectWithoutDepartmentInput[]
    createMany?: UserCreateManyDepartmentInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type CenterUpdateOneRequiredWithoutDepartmentNestedInput = {
    create?: XOR<CenterCreateWithoutDepartmentInput, CenterUncheckedCreateWithoutDepartmentInput>
    connectOrCreate?: CenterCreateOrConnectWithoutDepartmentInput
    upsert?: CenterUpsertWithoutDepartmentInput
    connect?: CenterWhereUniqueInput
    update?: XOR<XOR<CenterUpdateToOneWithWhereWithoutDepartmentInput, CenterUpdateWithoutDepartmentInput>, CenterUncheckedUpdateWithoutDepartmentInput>
  }

  export type UserUpdateManyWithoutDepartmentNestedInput = {
    create?: XOR<UserCreateWithoutDepartmentInput, UserUncheckedCreateWithoutDepartmentInput> | UserCreateWithoutDepartmentInput[] | UserUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: UserCreateOrConnectWithoutDepartmentInput | UserCreateOrConnectWithoutDepartmentInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutDepartmentInput | UserUpsertWithWhereUniqueWithoutDepartmentInput[]
    createMany?: UserCreateManyDepartmentInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutDepartmentInput | UserUpdateWithWhereUniqueWithoutDepartmentInput[]
    updateMany?: UserUpdateManyWithWhereWithoutDepartmentInput | UserUpdateManyWithWhereWithoutDepartmentInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type UserUncheckedUpdateManyWithoutDepartmentNestedInput = {
    create?: XOR<UserCreateWithoutDepartmentInput, UserUncheckedCreateWithoutDepartmentInput> | UserCreateWithoutDepartmentInput[] | UserUncheckedCreateWithoutDepartmentInput[]
    connectOrCreate?: UserCreateOrConnectWithoutDepartmentInput | UserCreateOrConnectWithoutDepartmentInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutDepartmentInput | UserUpsertWithWhereUniqueWithoutDepartmentInput[]
    createMany?: UserCreateManyDepartmentInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutDepartmentInput | UserUpdateWithWhereUniqueWithoutDepartmentInput[]
    updateMany?: UserUpdateManyWithWhereWithoutDepartmentInput | UserUpdateManyWithWhereWithoutDepartmentInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type ClaimCreateNestedOneWithoutSupervisedStudentInput = {
    create?: XOR<ClaimCreateWithoutSupervisedStudentInput, ClaimUncheckedCreateWithoutSupervisedStudentInput>
    connectOrCreate?: ClaimCreateOrConnectWithoutSupervisedStudentInput
    connect?: ClaimWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutSupervisedStudentInput = {
    create?: XOR<UserCreateWithoutSupervisedStudentInput, UserUncheckedCreateWithoutSupervisedStudentInput>
    connectOrCreate?: UserCreateOrConnectWithoutSupervisedStudentInput
    connect?: UserWhereUniqueInput
  }

  export type ClaimUpdateOneRequiredWithoutSupervisedStudentNestedInput = {
    create?: XOR<ClaimCreateWithoutSupervisedStudentInput, ClaimUncheckedCreateWithoutSupervisedStudentInput>
    connectOrCreate?: ClaimCreateOrConnectWithoutSupervisedStudentInput
    upsert?: ClaimUpsertWithoutSupervisedStudentInput
    connect?: ClaimWhereUniqueInput
    update?: XOR<XOR<ClaimUpdateToOneWithWhereWithoutSupervisedStudentInput, ClaimUpdateWithoutSupervisedStudentInput>, ClaimUncheckedUpdateWithoutSupervisedStudentInput>
  }

  export type UserUpdateOneRequiredWithoutSupervisedStudentNestedInput = {
    create?: XOR<UserCreateWithoutSupervisedStudentInput, UserUncheckedCreateWithoutSupervisedStudentInput>
    connectOrCreate?: UserCreateOrConnectWithoutSupervisedStudentInput
    upsert?: UserUpsertWithoutSupervisedStudentInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutSupervisedStudentInput, UserUpdateWithoutSupervisedStudentInput>, UserUncheckedUpdateWithoutSupervisedStudentInput>
  }

  export type CenterCreateNestedOneWithoutUser_Center_coordinatorIdToUserInput = {
    create?: XOR<CenterCreateWithoutUser_Center_coordinatorIdToUserInput, CenterUncheckedCreateWithoutUser_Center_coordinatorIdToUserInput>
    connectOrCreate?: CenterCreateOrConnectWithoutUser_Center_coordinatorIdToUserInput
    connect?: CenterWhereUniqueInput
  }

  export type ClaimCreateNestedManyWithoutUser_Claim_processedByIdToUserInput = {
    create?: XOR<ClaimCreateWithoutUser_Claim_processedByIdToUserInput, ClaimUncheckedCreateWithoutUser_Claim_processedByIdToUserInput> | ClaimCreateWithoutUser_Claim_processedByIdToUserInput[] | ClaimUncheckedCreateWithoutUser_Claim_processedByIdToUserInput[]
    connectOrCreate?: ClaimCreateOrConnectWithoutUser_Claim_processedByIdToUserInput | ClaimCreateOrConnectWithoutUser_Claim_processedByIdToUserInput[]
    createMany?: ClaimCreateManyUser_Claim_processedByIdToUserInputEnvelope
    connect?: ClaimWhereUniqueInput | ClaimWhereUniqueInput[]
  }

  export type ClaimCreateNestedManyWithoutUser_Claim_submittedByIdToUserInput = {
    create?: XOR<ClaimCreateWithoutUser_Claim_submittedByIdToUserInput, ClaimUncheckedCreateWithoutUser_Claim_submittedByIdToUserInput> | ClaimCreateWithoutUser_Claim_submittedByIdToUserInput[] | ClaimUncheckedCreateWithoutUser_Claim_submittedByIdToUserInput[]
    connectOrCreate?: ClaimCreateOrConnectWithoutUser_Claim_submittedByIdToUserInput | ClaimCreateOrConnectWithoutUser_Claim_submittedByIdToUserInput[]
    createMany?: ClaimCreateManyUser_Claim_submittedByIdToUserInputEnvelope
    connect?: ClaimWhereUniqueInput | ClaimWhereUniqueInput[]
  }

  export type SupervisedStudentCreateNestedManyWithoutUserInput = {
    create?: XOR<SupervisedStudentCreateWithoutUserInput, SupervisedStudentUncheckedCreateWithoutUserInput> | SupervisedStudentCreateWithoutUserInput[] | SupervisedStudentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SupervisedStudentCreateOrConnectWithoutUserInput | SupervisedStudentCreateOrConnectWithoutUserInput[]
    createMany?: SupervisedStudentCreateManyUserInputEnvelope
    connect?: SupervisedStudentWhereUniqueInput | SupervisedStudentWhereUniqueInput[]
  }

  export type DepartmentCreateNestedOneWithoutUserInput = {
    create?: XOR<DepartmentCreateWithoutUserInput, DepartmentUncheckedCreateWithoutUserInput>
    connectOrCreate?: DepartmentCreateOrConnectWithoutUserInput
    connect?: DepartmentWhereUniqueInput
  }

  export type CenterCreateNestedOneWithoutUser_User_lecturerCenterIdToCenterInput = {
    create?: XOR<CenterCreateWithoutUser_User_lecturerCenterIdToCenterInput, CenterUncheckedCreateWithoutUser_User_lecturerCenterIdToCenterInput>
    connectOrCreate?: CenterCreateOrConnectWithoutUser_User_lecturerCenterIdToCenterInput
    connect?: CenterWhereUniqueInput
  }

  export type CenterUncheckedCreateNestedOneWithoutUser_Center_coordinatorIdToUserInput = {
    create?: XOR<CenterCreateWithoutUser_Center_coordinatorIdToUserInput, CenterUncheckedCreateWithoutUser_Center_coordinatorIdToUserInput>
    connectOrCreate?: CenterCreateOrConnectWithoutUser_Center_coordinatorIdToUserInput
    connect?: CenterWhereUniqueInput
  }

  export type ClaimUncheckedCreateNestedManyWithoutUser_Claim_processedByIdToUserInput = {
    create?: XOR<ClaimCreateWithoutUser_Claim_processedByIdToUserInput, ClaimUncheckedCreateWithoutUser_Claim_processedByIdToUserInput> | ClaimCreateWithoutUser_Claim_processedByIdToUserInput[] | ClaimUncheckedCreateWithoutUser_Claim_processedByIdToUserInput[]
    connectOrCreate?: ClaimCreateOrConnectWithoutUser_Claim_processedByIdToUserInput | ClaimCreateOrConnectWithoutUser_Claim_processedByIdToUserInput[]
    createMany?: ClaimCreateManyUser_Claim_processedByIdToUserInputEnvelope
    connect?: ClaimWhereUniqueInput | ClaimWhereUniqueInput[]
  }

  export type ClaimUncheckedCreateNestedManyWithoutUser_Claim_submittedByIdToUserInput = {
    create?: XOR<ClaimCreateWithoutUser_Claim_submittedByIdToUserInput, ClaimUncheckedCreateWithoutUser_Claim_submittedByIdToUserInput> | ClaimCreateWithoutUser_Claim_submittedByIdToUserInput[] | ClaimUncheckedCreateWithoutUser_Claim_submittedByIdToUserInput[]
    connectOrCreate?: ClaimCreateOrConnectWithoutUser_Claim_submittedByIdToUserInput | ClaimCreateOrConnectWithoutUser_Claim_submittedByIdToUserInput[]
    createMany?: ClaimCreateManyUser_Claim_submittedByIdToUserInputEnvelope
    connect?: ClaimWhereUniqueInput | ClaimWhereUniqueInput[]
  }

  export type SupervisedStudentUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<SupervisedStudentCreateWithoutUserInput, SupervisedStudentUncheckedCreateWithoutUserInput> | SupervisedStudentCreateWithoutUserInput[] | SupervisedStudentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SupervisedStudentCreateOrConnectWithoutUserInput | SupervisedStudentCreateOrConnectWithoutUserInput[]
    createMany?: SupervisedStudentCreateManyUserInputEnvelope
    connect?: SupervisedStudentWhereUniqueInput | SupervisedStudentWhereUniqueInput[]
  }

  export type EnumUser_roleFieldUpdateOperationsInput = {
    set?: $Enums.User_role
  }

  export type CenterUpdateOneWithoutUser_Center_coordinatorIdToUserNestedInput = {
    create?: XOR<CenterCreateWithoutUser_Center_coordinatorIdToUserInput, CenterUncheckedCreateWithoutUser_Center_coordinatorIdToUserInput>
    connectOrCreate?: CenterCreateOrConnectWithoutUser_Center_coordinatorIdToUserInput
    upsert?: CenterUpsertWithoutUser_Center_coordinatorIdToUserInput
    disconnect?: CenterWhereInput | boolean
    delete?: CenterWhereInput | boolean
    connect?: CenterWhereUniqueInput
    update?: XOR<XOR<CenterUpdateToOneWithWhereWithoutUser_Center_coordinatorIdToUserInput, CenterUpdateWithoutUser_Center_coordinatorIdToUserInput>, CenterUncheckedUpdateWithoutUser_Center_coordinatorIdToUserInput>
  }

  export type ClaimUpdateManyWithoutUser_Claim_processedByIdToUserNestedInput = {
    create?: XOR<ClaimCreateWithoutUser_Claim_processedByIdToUserInput, ClaimUncheckedCreateWithoutUser_Claim_processedByIdToUserInput> | ClaimCreateWithoutUser_Claim_processedByIdToUserInput[] | ClaimUncheckedCreateWithoutUser_Claim_processedByIdToUserInput[]
    connectOrCreate?: ClaimCreateOrConnectWithoutUser_Claim_processedByIdToUserInput | ClaimCreateOrConnectWithoutUser_Claim_processedByIdToUserInput[]
    upsert?: ClaimUpsertWithWhereUniqueWithoutUser_Claim_processedByIdToUserInput | ClaimUpsertWithWhereUniqueWithoutUser_Claim_processedByIdToUserInput[]
    createMany?: ClaimCreateManyUser_Claim_processedByIdToUserInputEnvelope
    set?: ClaimWhereUniqueInput | ClaimWhereUniqueInput[]
    disconnect?: ClaimWhereUniqueInput | ClaimWhereUniqueInput[]
    delete?: ClaimWhereUniqueInput | ClaimWhereUniqueInput[]
    connect?: ClaimWhereUniqueInput | ClaimWhereUniqueInput[]
    update?: ClaimUpdateWithWhereUniqueWithoutUser_Claim_processedByIdToUserInput | ClaimUpdateWithWhereUniqueWithoutUser_Claim_processedByIdToUserInput[]
    updateMany?: ClaimUpdateManyWithWhereWithoutUser_Claim_processedByIdToUserInput | ClaimUpdateManyWithWhereWithoutUser_Claim_processedByIdToUserInput[]
    deleteMany?: ClaimScalarWhereInput | ClaimScalarWhereInput[]
  }

  export type ClaimUpdateManyWithoutUser_Claim_submittedByIdToUserNestedInput = {
    create?: XOR<ClaimCreateWithoutUser_Claim_submittedByIdToUserInput, ClaimUncheckedCreateWithoutUser_Claim_submittedByIdToUserInput> | ClaimCreateWithoutUser_Claim_submittedByIdToUserInput[] | ClaimUncheckedCreateWithoutUser_Claim_submittedByIdToUserInput[]
    connectOrCreate?: ClaimCreateOrConnectWithoutUser_Claim_submittedByIdToUserInput | ClaimCreateOrConnectWithoutUser_Claim_submittedByIdToUserInput[]
    upsert?: ClaimUpsertWithWhereUniqueWithoutUser_Claim_submittedByIdToUserInput | ClaimUpsertWithWhereUniqueWithoutUser_Claim_submittedByIdToUserInput[]
    createMany?: ClaimCreateManyUser_Claim_submittedByIdToUserInputEnvelope
    set?: ClaimWhereUniqueInput | ClaimWhereUniqueInput[]
    disconnect?: ClaimWhereUniqueInput | ClaimWhereUniqueInput[]
    delete?: ClaimWhereUniqueInput | ClaimWhereUniqueInput[]
    connect?: ClaimWhereUniqueInput | ClaimWhereUniqueInput[]
    update?: ClaimUpdateWithWhereUniqueWithoutUser_Claim_submittedByIdToUserInput | ClaimUpdateWithWhereUniqueWithoutUser_Claim_submittedByIdToUserInput[]
    updateMany?: ClaimUpdateManyWithWhereWithoutUser_Claim_submittedByIdToUserInput | ClaimUpdateManyWithWhereWithoutUser_Claim_submittedByIdToUserInput[]
    deleteMany?: ClaimScalarWhereInput | ClaimScalarWhereInput[]
  }

  export type SupervisedStudentUpdateManyWithoutUserNestedInput = {
    create?: XOR<SupervisedStudentCreateWithoutUserInput, SupervisedStudentUncheckedCreateWithoutUserInput> | SupervisedStudentCreateWithoutUserInput[] | SupervisedStudentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SupervisedStudentCreateOrConnectWithoutUserInput | SupervisedStudentCreateOrConnectWithoutUserInput[]
    upsert?: SupervisedStudentUpsertWithWhereUniqueWithoutUserInput | SupervisedStudentUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SupervisedStudentCreateManyUserInputEnvelope
    set?: SupervisedStudentWhereUniqueInput | SupervisedStudentWhereUniqueInput[]
    disconnect?: SupervisedStudentWhereUniqueInput | SupervisedStudentWhereUniqueInput[]
    delete?: SupervisedStudentWhereUniqueInput | SupervisedStudentWhereUniqueInput[]
    connect?: SupervisedStudentWhereUniqueInput | SupervisedStudentWhereUniqueInput[]
    update?: SupervisedStudentUpdateWithWhereUniqueWithoutUserInput | SupervisedStudentUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SupervisedStudentUpdateManyWithWhereWithoutUserInput | SupervisedStudentUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SupervisedStudentScalarWhereInput | SupervisedStudentScalarWhereInput[]
  }

  export type DepartmentUpdateOneWithoutUserNestedInput = {
    create?: XOR<DepartmentCreateWithoutUserInput, DepartmentUncheckedCreateWithoutUserInput>
    connectOrCreate?: DepartmentCreateOrConnectWithoutUserInput
    upsert?: DepartmentUpsertWithoutUserInput
    disconnect?: DepartmentWhereInput | boolean
    delete?: DepartmentWhereInput | boolean
    connect?: DepartmentWhereUniqueInput
    update?: XOR<XOR<DepartmentUpdateToOneWithWhereWithoutUserInput, DepartmentUpdateWithoutUserInput>, DepartmentUncheckedUpdateWithoutUserInput>
  }

  export type CenterUpdateOneWithoutUser_User_lecturerCenterIdToCenterNestedInput = {
    create?: XOR<CenterCreateWithoutUser_User_lecturerCenterIdToCenterInput, CenterUncheckedCreateWithoutUser_User_lecturerCenterIdToCenterInput>
    connectOrCreate?: CenterCreateOrConnectWithoutUser_User_lecturerCenterIdToCenterInput
    upsert?: CenterUpsertWithoutUser_User_lecturerCenterIdToCenterInput
    disconnect?: CenterWhereInput | boolean
    delete?: CenterWhereInput | boolean
    connect?: CenterWhereUniqueInput
    update?: XOR<XOR<CenterUpdateToOneWithWhereWithoutUser_User_lecturerCenterIdToCenterInput, CenterUpdateWithoutUser_User_lecturerCenterIdToCenterInput>, CenterUncheckedUpdateWithoutUser_User_lecturerCenterIdToCenterInput>
  }

  export type CenterUncheckedUpdateOneWithoutUser_Center_coordinatorIdToUserNestedInput = {
    create?: XOR<CenterCreateWithoutUser_Center_coordinatorIdToUserInput, CenterUncheckedCreateWithoutUser_Center_coordinatorIdToUserInput>
    connectOrCreate?: CenterCreateOrConnectWithoutUser_Center_coordinatorIdToUserInput
    upsert?: CenterUpsertWithoutUser_Center_coordinatorIdToUserInput
    disconnect?: CenterWhereInput | boolean
    delete?: CenterWhereInput | boolean
    connect?: CenterWhereUniqueInput
    update?: XOR<XOR<CenterUpdateToOneWithWhereWithoutUser_Center_coordinatorIdToUserInput, CenterUpdateWithoutUser_Center_coordinatorIdToUserInput>, CenterUncheckedUpdateWithoutUser_Center_coordinatorIdToUserInput>
  }

  export type ClaimUncheckedUpdateManyWithoutUser_Claim_processedByIdToUserNestedInput = {
    create?: XOR<ClaimCreateWithoutUser_Claim_processedByIdToUserInput, ClaimUncheckedCreateWithoutUser_Claim_processedByIdToUserInput> | ClaimCreateWithoutUser_Claim_processedByIdToUserInput[] | ClaimUncheckedCreateWithoutUser_Claim_processedByIdToUserInput[]
    connectOrCreate?: ClaimCreateOrConnectWithoutUser_Claim_processedByIdToUserInput | ClaimCreateOrConnectWithoutUser_Claim_processedByIdToUserInput[]
    upsert?: ClaimUpsertWithWhereUniqueWithoutUser_Claim_processedByIdToUserInput | ClaimUpsertWithWhereUniqueWithoutUser_Claim_processedByIdToUserInput[]
    createMany?: ClaimCreateManyUser_Claim_processedByIdToUserInputEnvelope
    set?: ClaimWhereUniqueInput | ClaimWhereUniqueInput[]
    disconnect?: ClaimWhereUniqueInput | ClaimWhereUniqueInput[]
    delete?: ClaimWhereUniqueInput | ClaimWhereUniqueInput[]
    connect?: ClaimWhereUniqueInput | ClaimWhereUniqueInput[]
    update?: ClaimUpdateWithWhereUniqueWithoutUser_Claim_processedByIdToUserInput | ClaimUpdateWithWhereUniqueWithoutUser_Claim_processedByIdToUserInput[]
    updateMany?: ClaimUpdateManyWithWhereWithoutUser_Claim_processedByIdToUserInput | ClaimUpdateManyWithWhereWithoutUser_Claim_processedByIdToUserInput[]
    deleteMany?: ClaimScalarWhereInput | ClaimScalarWhereInput[]
  }

  export type ClaimUncheckedUpdateManyWithoutUser_Claim_submittedByIdToUserNestedInput = {
    create?: XOR<ClaimCreateWithoutUser_Claim_submittedByIdToUserInput, ClaimUncheckedCreateWithoutUser_Claim_submittedByIdToUserInput> | ClaimCreateWithoutUser_Claim_submittedByIdToUserInput[] | ClaimUncheckedCreateWithoutUser_Claim_submittedByIdToUserInput[]
    connectOrCreate?: ClaimCreateOrConnectWithoutUser_Claim_submittedByIdToUserInput | ClaimCreateOrConnectWithoutUser_Claim_submittedByIdToUserInput[]
    upsert?: ClaimUpsertWithWhereUniqueWithoutUser_Claim_submittedByIdToUserInput | ClaimUpsertWithWhereUniqueWithoutUser_Claim_submittedByIdToUserInput[]
    createMany?: ClaimCreateManyUser_Claim_submittedByIdToUserInputEnvelope
    set?: ClaimWhereUniqueInput | ClaimWhereUniqueInput[]
    disconnect?: ClaimWhereUniqueInput | ClaimWhereUniqueInput[]
    delete?: ClaimWhereUniqueInput | ClaimWhereUniqueInput[]
    connect?: ClaimWhereUniqueInput | ClaimWhereUniqueInput[]
    update?: ClaimUpdateWithWhereUniqueWithoutUser_Claim_submittedByIdToUserInput | ClaimUpdateWithWhereUniqueWithoutUser_Claim_submittedByIdToUserInput[]
    updateMany?: ClaimUpdateManyWithWhereWithoutUser_Claim_submittedByIdToUserInput | ClaimUpdateManyWithWhereWithoutUser_Claim_submittedByIdToUserInput[]
    deleteMany?: ClaimScalarWhereInput | ClaimScalarWhereInput[]
  }

  export type SupervisedStudentUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<SupervisedStudentCreateWithoutUserInput, SupervisedStudentUncheckedCreateWithoutUserInput> | SupervisedStudentCreateWithoutUserInput[] | SupervisedStudentUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SupervisedStudentCreateOrConnectWithoutUserInput | SupervisedStudentCreateOrConnectWithoutUserInput[]
    upsert?: SupervisedStudentUpsertWithWhereUniqueWithoutUserInput | SupervisedStudentUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SupervisedStudentCreateManyUserInputEnvelope
    set?: SupervisedStudentWhereUniqueInput | SupervisedStudentWhereUniqueInput[]
    disconnect?: SupervisedStudentWhereUniqueInput | SupervisedStudentWhereUniqueInput[]
    delete?: SupervisedStudentWhereUniqueInput | SupervisedStudentWhereUniqueInput[]
    connect?: SupervisedStudentWhereUniqueInput | SupervisedStudentWhereUniqueInput[]
    update?: SupervisedStudentUpdateWithWhereUniqueWithoutUserInput | SupervisedStudentUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SupervisedStudentUpdateManyWithWhereWithoutUserInput | SupervisedStudentUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SupervisedStudentScalarWhereInput | SupervisedStudentScalarWhereInput[]
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumClaim_claimTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.Claim_claimType | EnumClaim_claimTypeFieldRefInput<$PrismaModel>
    in?: $Enums.Claim_claimType[]
    notIn?: $Enums.Claim_claimType[]
    not?: NestedEnumClaim_claimTypeFilter<$PrismaModel> | $Enums.Claim_claimType
  }

  export type NestedEnumClaim_statusFilter<$PrismaModel = never> = {
    equals?: $Enums.Claim_status | EnumClaim_statusFieldRefInput<$PrismaModel>
    in?: $Enums.Claim_status[]
    notIn?: $Enums.Claim_status[]
    not?: NestedEnumClaim_statusFilter<$PrismaModel> | $Enums.Claim_status
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumClaim_transportTypeNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.Claim_transportType | EnumClaim_transportTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.Claim_transportType[] | null
    notIn?: $Enums.Claim_transportType[] | null
    not?: NestedEnumClaim_transportTypeNullableFilter<$PrismaModel> | $Enums.Claim_transportType | null
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumClaim_thesisTypeNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.Claim_thesisType | EnumClaim_thesisTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.Claim_thesisType[] | null
    notIn?: $Enums.Claim_thesisType[] | null
    not?: NestedEnumClaim_thesisTypeNullableFilter<$PrismaModel> | $Enums.Claim_thesisType | null
  }

  export type NestedEnumClaim_thesisSupervisionRankNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.Claim_thesisSupervisionRank | EnumClaim_thesisSupervisionRankFieldRefInput<$PrismaModel> | null
    in?: $Enums.Claim_thesisSupervisionRank[] | null
    notIn?: $Enums.Claim_thesisSupervisionRank[] | null
    not?: NestedEnumClaim_thesisSupervisionRankNullableFilter<$PrismaModel> | $Enums.Claim_thesisSupervisionRank | null
  }

  export type NestedEnumClaim_claimTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Claim_claimType | EnumClaim_claimTypeFieldRefInput<$PrismaModel>
    in?: $Enums.Claim_claimType[]
    notIn?: $Enums.Claim_claimType[]
    not?: NestedEnumClaim_claimTypeWithAggregatesFilter<$PrismaModel> | $Enums.Claim_claimType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumClaim_claimTypeFilter<$PrismaModel>
    _max?: NestedEnumClaim_claimTypeFilter<$PrismaModel>
  }

  export type NestedEnumClaim_statusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Claim_status | EnumClaim_statusFieldRefInput<$PrismaModel>
    in?: $Enums.Claim_status[]
    notIn?: $Enums.Claim_status[]
    not?: NestedEnumClaim_statusWithAggregatesFilter<$PrismaModel> | $Enums.Claim_status
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumClaim_statusFilter<$PrismaModel>
    _max?: NestedEnumClaim_statusFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedEnumClaim_transportTypeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Claim_transportType | EnumClaim_transportTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.Claim_transportType[] | null
    notIn?: $Enums.Claim_transportType[] | null
    not?: NestedEnumClaim_transportTypeNullableWithAggregatesFilter<$PrismaModel> | $Enums.Claim_transportType | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumClaim_transportTypeNullableFilter<$PrismaModel>
    _max?: NestedEnumClaim_transportTypeNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedEnumClaim_thesisTypeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Claim_thesisType | EnumClaim_thesisTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.Claim_thesisType[] | null
    notIn?: $Enums.Claim_thesisType[] | null
    not?: NestedEnumClaim_thesisTypeNullableWithAggregatesFilter<$PrismaModel> | $Enums.Claim_thesisType | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumClaim_thesisTypeNullableFilter<$PrismaModel>
    _max?: NestedEnumClaim_thesisTypeNullableFilter<$PrismaModel>
  }

  export type NestedEnumClaim_thesisSupervisionRankNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Claim_thesisSupervisionRank | EnumClaim_thesisSupervisionRankFieldRefInput<$PrismaModel> | null
    in?: $Enums.Claim_thesisSupervisionRank[] | null
    notIn?: $Enums.Claim_thesisSupervisionRank[] | null
    not?: NestedEnumClaim_thesisSupervisionRankNullableWithAggregatesFilter<$PrismaModel> | $Enums.Claim_thesisSupervisionRank | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumClaim_thesisSupervisionRankNullableFilter<$PrismaModel>
    _max?: NestedEnumClaim_thesisSupervisionRankNullableFilter<$PrismaModel>
  }

  export type NestedEnumUser_roleFilter<$PrismaModel = never> = {
    equals?: $Enums.User_role | EnumUser_roleFieldRefInput<$PrismaModel>
    in?: $Enums.User_role[]
    notIn?: $Enums.User_role[]
    not?: NestedEnumUser_roleFilter<$PrismaModel> | $Enums.User_role
  }

  export type NestedEnumUser_roleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.User_role | EnumUser_roleFieldRefInput<$PrismaModel>
    in?: $Enums.User_role[]
    notIn?: $Enums.User_role[]
    not?: NestedEnumUser_roleWithAggregatesFilter<$PrismaModel> | $Enums.User_role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUser_roleFilter<$PrismaModel>
    _max?: NestedEnumUser_roleFilter<$PrismaModel>
  }

  export type UserCreateWithoutCenter_Center_coordinatorIdToUserInput = {
    id: string
    email: string
    name?: string | null
    password: string
    role: $Enums.User_role
    createdAt?: Date | string
    updatedAt: Date | string
    Claim_Claim_processedByIdToUser?: ClaimCreateNestedManyWithoutUser_Claim_processedByIdToUserInput
    Claim_Claim_submittedByIdToUser?: ClaimCreateNestedManyWithoutUser_Claim_submittedByIdToUserInput
    SupervisedStudent?: SupervisedStudentCreateNestedManyWithoutUserInput
    Department?: DepartmentCreateNestedOneWithoutUserInput
    Center_User_lecturerCenterIdToCenter?: CenterCreateNestedOneWithoutUser_User_lecturerCenterIdToCenterInput
  }

  export type UserUncheckedCreateWithoutCenter_Center_coordinatorIdToUserInput = {
    id: string
    email: string
    name?: string | null
    password: string
    role: $Enums.User_role
    createdAt?: Date | string
    updatedAt: Date | string
    lecturerCenterId?: string | null
    departmentId?: string | null
    Claim_Claim_processedByIdToUser?: ClaimUncheckedCreateNestedManyWithoutUser_Claim_processedByIdToUserInput
    Claim_Claim_submittedByIdToUser?: ClaimUncheckedCreateNestedManyWithoutUser_Claim_submittedByIdToUserInput
    SupervisedStudent?: SupervisedStudentUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutCenter_Center_coordinatorIdToUserInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutCenter_Center_coordinatorIdToUserInput, UserUncheckedCreateWithoutCenter_Center_coordinatorIdToUserInput>
  }

  export type ClaimCreateWithoutCenterInput = {
    id: string
    claimType: $Enums.Claim_claimType
    status?: $Enums.Claim_status
    submittedAt?: Date | string
    updatedAt: Date | string
    processedAt?: Date | string | null
    teachingDate?: Date | string | null
    teachingStartTime?: string | null
    teachingEndTime?: string | null
    teachingHours?: number | null
    transportType?: $Enums.Claim_transportType | null
    transportDestinationTo?: string | null
    transportDestinationFrom?: string | null
    transportRegNumber?: string | null
    transportCubicCapacity?: number | null
    transportAmount?: number | null
    thesisType?: $Enums.Claim_thesisType | null
    thesisSupervisionRank?: $Enums.Claim_thesisSupervisionRank | null
    thesisExamCourseCode?: string | null
    thesisExamDate?: Date | string | null
    User_Claim_processedByIdToUser?: UserCreateNestedOneWithoutClaim_Claim_processedByIdToUserInput
    User_Claim_submittedByIdToUser: UserCreateNestedOneWithoutClaim_Claim_submittedByIdToUserInput
    SupervisedStudent?: SupervisedStudentCreateNestedManyWithoutClaimInput
  }

  export type ClaimUncheckedCreateWithoutCenterInput = {
    id: string
    claimType: $Enums.Claim_claimType
    status?: $Enums.Claim_status
    submittedAt?: Date | string
    updatedAt: Date | string
    processedAt?: Date | string | null
    submittedById: string
    processedById?: string | null
    teachingDate?: Date | string | null
    teachingStartTime?: string | null
    teachingEndTime?: string | null
    teachingHours?: number | null
    transportType?: $Enums.Claim_transportType | null
    transportDestinationTo?: string | null
    transportDestinationFrom?: string | null
    transportRegNumber?: string | null
    transportCubicCapacity?: number | null
    transportAmount?: number | null
    thesisType?: $Enums.Claim_thesisType | null
    thesisSupervisionRank?: $Enums.Claim_thesisSupervisionRank | null
    thesisExamCourseCode?: string | null
    thesisExamDate?: Date | string | null
    SupervisedStudent?: SupervisedStudentUncheckedCreateNestedManyWithoutClaimInput
  }

  export type ClaimCreateOrConnectWithoutCenterInput = {
    where: ClaimWhereUniqueInput
    create: XOR<ClaimCreateWithoutCenterInput, ClaimUncheckedCreateWithoutCenterInput>
  }

  export type ClaimCreateManyCenterInputEnvelope = {
    data: ClaimCreateManyCenterInput | ClaimCreateManyCenterInput[]
    skipDuplicates?: boolean
  }

  export type DepartmentCreateWithoutCenterInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt: Date | string
    User?: UserCreateNestedManyWithoutDepartmentInput
  }

  export type DepartmentUncheckedCreateWithoutCenterInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt: Date | string
    User?: UserUncheckedCreateNestedManyWithoutDepartmentInput
  }

  export type DepartmentCreateOrConnectWithoutCenterInput = {
    where: DepartmentWhereUniqueInput
    create: XOR<DepartmentCreateWithoutCenterInput, DepartmentUncheckedCreateWithoutCenterInput>
  }

  export type DepartmentCreateManyCenterInputEnvelope = {
    data: DepartmentCreateManyCenterInput | DepartmentCreateManyCenterInput[]
    skipDuplicates?: boolean
  }

  export type UserCreateWithoutCenter_User_lecturerCenterIdToCenterInput = {
    id: string
    email: string
    name?: string | null
    password: string
    role: $Enums.User_role
    createdAt?: Date | string
    updatedAt: Date | string
    Center_Center_coordinatorIdToUser?: CenterCreateNestedOneWithoutUser_Center_coordinatorIdToUserInput
    Claim_Claim_processedByIdToUser?: ClaimCreateNestedManyWithoutUser_Claim_processedByIdToUserInput
    Claim_Claim_submittedByIdToUser?: ClaimCreateNestedManyWithoutUser_Claim_submittedByIdToUserInput
    SupervisedStudent?: SupervisedStudentCreateNestedManyWithoutUserInput
    Department?: DepartmentCreateNestedOneWithoutUserInput
  }

  export type UserUncheckedCreateWithoutCenter_User_lecturerCenterIdToCenterInput = {
    id: string
    email: string
    name?: string | null
    password: string
    role: $Enums.User_role
    createdAt?: Date | string
    updatedAt: Date | string
    departmentId?: string | null
    Center_Center_coordinatorIdToUser?: CenterUncheckedCreateNestedOneWithoutUser_Center_coordinatorIdToUserInput
    Claim_Claim_processedByIdToUser?: ClaimUncheckedCreateNestedManyWithoutUser_Claim_processedByIdToUserInput
    Claim_Claim_submittedByIdToUser?: ClaimUncheckedCreateNestedManyWithoutUser_Claim_submittedByIdToUserInput
    SupervisedStudent?: SupervisedStudentUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutCenter_User_lecturerCenterIdToCenterInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutCenter_User_lecturerCenterIdToCenterInput, UserUncheckedCreateWithoutCenter_User_lecturerCenterIdToCenterInput>
  }

  export type UserCreateManyCenter_User_lecturerCenterIdToCenterInputEnvelope = {
    data: UserCreateManyCenter_User_lecturerCenterIdToCenterInput | UserCreateManyCenter_User_lecturerCenterIdToCenterInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutCenter_Center_coordinatorIdToUserInput = {
    update: XOR<UserUpdateWithoutCenter_Center_coordinatorIdToUserInput, UserUncheckedUpdateWithoutCenter_Center_coordinatorIdToUserInput>
    create: XOR<UserCreateWithoutCenter_Center_coordinatorIdToUserInput, UserUncheckedCreateWithoutCenter_Center_coordinatorIdToUserInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutCenter_Center_coordinatorIdToUserInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutCenter_Center_coordinatorIdToUserInput, UserUncheckedUpdateWithoutCenter_Center_coordinatorIdToUserInput>
  }

  export type UserUpdateWithoutCenter_Center_coordinatorIdToUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUser_roleFieldUpdateOperationsInput | $Enums.User_role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Claim_Claim_processedByIdToUser?: ClaimUpdateManyWithoutUser_Claim_processedByIdToUserNestedInput
    Claim_Claim_submittedByIdToUser?: ClaimUpdateManyWithoutUser_Claim_submittedByIdToUserNestedInput
    SupervisedStudent?: SupervisedStudentUpdateManyWithoutUserNestedInput
    Department?: DepartmentUpdateOneWithoutUserNestedInput
    Center_User_lecturerCenterIdToCenter?: CenterUpdateOneWithoutUser_User_lecturerCenterIdToCenterNestedInput
  }

  export type UserUncheckedUpdateWithoutCenter_Center_coordinatorIdToUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUser_roleFieldUpdateOperationsInput | $Enums.User_role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lecturerCenterId?: NullableStringFieldUpdateOperationsInput | string | null
    departmentId?: NullableStringFieldUpdateOperationsInput | string | null
    Claim_Claim_processedByIdToUser?: ClaimUncheckedUpdateManyWithoutUser_Claim_processedByIdToUserNestedInput
    Claim_Claim_submittedByIdToUser?: ClaimUncheckedUpdateManyWithoutUser_Claim_submittedByIdToUserNestedInput
    SupervisedStudent?: SupervisedStudentUncheckedUpdateManyWithoutUserNestedInput
  }

  export type ClaimUpsertWithWhereUniqueWithoutCenterInput = {
    where: ClaimWhereUniqueInput
    update: XOR<ClaimUpdateWithoutCenterInput, ClaimUncheckedUpdateWithoutCenterInput>
    create: XOR<ClaimCreateWithoutCenterInput, ClaimUncheckedCreateWithoutCenterInput>
  }

  export type ClaimUpdateWithWhereUniqueWithoutCenterInput = {
    where: ClaimWhereUniqueInput
    data: XOR<ClaimUpdateWithoutCenterInput, ClaimUncheckedUpdateWithoutCenterInput>
  }

  export type ClaimUpdateManyWithWhereWithoutCenterInput = {
    where: ClaimScalarWhereInput
    data: XOR<ClaimUpdateManyMutationInput, ClaimUncheckedUpdateManyWithoutCenterInput>
  }

  export type ClaimScalarWhereInput = {
    AND?: ClaimScalarWhereInput | ClaimScalarWhereInput[]
    OR?: ClaimScalarWhereInput[]
    NOT?: ClaimScalarWhereInput | ClaimScalarWhereInput[]
    id?: StringFilter<"Claim"> | string
    claimType?: EnumClaim_claimTypeFilter<"Claim"> | $Enums.Claim_claimType
    status?: EnumClaim_statusFilter<"Claim"> | $Enums.Claim_status
    submittedAt?: DateTimeFilter<"Claim"> | Date | string
    updatedAt?: DateTimeFilter<"Claim"> | Date | string
    processedAt?: DateTimeNullableFilter<"Claim"> | Date | string | null
    submittedById?: StringFilter<"Claim"> | string
    centerId?: StringFilter<"Claim"> | string
    processedById?: StringNullableFilter<"Claim"> | string | null
    teachingDate?: DateTimeNullableFilter<"Claim"> | Date | string | null
    teachingStartTime?: StringNullableFilter<"Claim"> | string | null
    teachingEndTime?: StringNullableFilter<"Claim"> | string | null
    teachingHours?: FloatNullableFilter<"Claim"> | number | null
    transportType?: EnumClaim_transportTypeNullableFilter<"Claim"> | $Enums.Claim_transportType | null
    transportDestinationTo?: StringNullableFilter<"Claim"> | string | null
    transportDestinationFrom?: StringNullableFilter<"Claim"> | string | null
    transportRegNumber?: StringNullableFilter<"Claim"> | string | null
    transportCubicCapacity?: IntNullableFilter<"Claim"> | number | null
    transportAmount?: FloatNullableFilter<"Claim"> | number | null
    thesisType?: EnumClaim_thesisTypeNullableFilter<"Claim"> | $Enums.Claim_thesisType | null
    thesisSupervisionRank?: EnumClaim_thesisSupervisionRankNullableFilter<"Claim"> | $Enums.Claim_thesisSupervisionRank | null
    thesisExamCourseCode?: StringNullableFilter<"Claim"> | string | null
    thesisExamDate?: DateTimeNullableFilter<"Claim"> | Date | string | null
  }

  export type DepartmentUpsertWithWhereUniqueWithoutCenterInput = {
    where: DepartmentWhereUniqueInput
    update: XOR<DepartmentUpdateWithoutCenterInput, DepartmentUncheckedUpdateWithoutCenterInput>
    create: XOR<DepartmentCreateWithoutCenterInput, DepartmentUncheckedCreateWithoutCenterInput>
  }

  export type DepartmentUpdateWithWhereUniqueWithoutCenterInput = {
    where: DepartmentWhereUniqueInput
    data: XOR<DepartmentUpdateWithoutCenterInput, DepartmentUncheckedUpdateWithoutCenterInput>
  }

  export type DepartmentUpdateManyWithWhereWithoutCenterInput = {
    where: DepartmentScalarWhereInput
    data: XOR<DepartmentUpdateManyMutationInput, DepartmentUncheckedUpdateManyWithoutCenterInput>
  }

  export type DepartmentScalarWhereInput = {
    AND?: DepartmentScalarWhereInput | DepartmentScalarWhereInput[]
    OR?: DepartmentScalarWhereInput[]
    NOT?: DepartmentScalarWhereInput | DepartmentScalarWhereInput[]
    id?: StringFilter<"Department"> | string
    name?: StringFilter<"Department"> | string
    createdAt?: DateTimeFilter<"Department"> | Date | string
    updatedAt?: DateTimeFilter<"Department"> | Date | string
    centerId?: StringFilter<"Department"> | string
  }

  export type UserUpsertWithWhereUniqueWithoutCenter_User_lecturerCenterIdToCenterInput = {
    where: UserWhereUniqueInput
    update: XOR<UserUpdateWithoutCenter_User_lecturerCenterIdToCenterInput, UserUncheckedUpdateWithoutCenter_User_lecturerCenterIdToCenterInput>
    create: XOR<UserCreateWithoutCenter_User_lecturerCenterIdToCenterInput, UserUncheckedCreateWithoutCenter_User_lecturerCenterIdToCenterInput>
  }

  export type UserUpdateWithWhereUniqueWithoutCenter_User_lecturerCenterIdToCenterInput = {
    where: UserWhereUniqueInput
    data: XOR<UserUpdateWithoutCenter_User_lecturerCenterIdToCenterInput, UserUncheckedUpdateWithoutCenter_User_lecturerCenterIdToCenterInput>
  }

  export type UserUpdateManyWithWhereWithoutCenter_User_lecturerCenterIdToCenterInput = {
    where: UserScalarWhereInput
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyWithoutCenter_User_lecturerCenterIdToCenterInput>
  }

  export type UserScalarWhereInput = {
    AND?: UserScalarWhereInput | UserScalarWhereInput[]
    OR?: UserScalarWhereInput[]
    NOT?: UserScalarWhereInput | UserScalarWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    name?: StringNullableFilter<"User"> | string | null
    password?: StringFilter<"User"> | string
    role?: EnumUser_roleFilter<"User"> | $Enums.User_role
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    lecturerCenterId?: StringNullableFilter<"User"> | string | null
    departmentId?: StringNullableFilter<"User"> | string | null
  }

  export type CenterCreateWithoutClaimInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt: Date | string
    User_Center_coordinatorIdToUser: UserCreateNestedOneWithoutCenter_Center_coordinatorIdToUserInput
    Department?: DepartmentCreateNestedManyWithoutCenterInput
    User_User_lecturerCenterIdToCenter?: UserCreateNestedManyWithoutCenter_User_lecturerCenterIdToCenterInput
  }

  export type CenterUncheckedCreateWithoutClaimInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt: Date | string
    coordinatorId: string
    Department?: DepartmentUncheckedCreateNestedManyWithoutCenterInput
    User_User_lecturerCenterIdToCenter?: UserUncheckedCreateNestedManyWithoutCenter_User_lecturerCenterIdToCenterInput
  }

  export type CenterCreateOrConnectWithoutClaimInput = {
    where: CenterWhereUniqueInput
    create: XOR<CenterCreateWithoutClaimInput, CenterUncheckedCreateWithoutClaimInput>
  }

  export type UserCreateWithoutClaim_Claim_processedByIdToUserInput = {
    id: string
    email: string
    name?: string | null
    password: string
    role: $Enums.User_role
    createdAt?: Date | string
    updatedAt: Date | string
    Center_Center_coordinatorIdToUser?: CenterCreateNestedOneWithoutUser_Center_coordinatorIdToUserInput
    Claim_Claim_submittedByIdToUser?: ClaimCreateNestedManyWithoutUser_Claim_submittedByIdToUserInput
    SupervisedStudent?: SupervisedStudentCreateNestedManyWithoutUserInput
    Department?: DepartmentCreateNestedOneWithoutUserInput
    Center_User_lecturerCenterIdToCenter?: CenterCreateNestedOneWithoutUser_User_lecturerCenterIdToCenterInput
  }

  export type UserUncheckedCreateWithoutClaim_Claim_processedByIdToUserInput = {
    id: string
    email: string
    name?: string | null
    password: string
    role: $Enums.User_role
    createdAt?: Date | string
    updatedAt: Date | string
    lecturerCenterId?: string | null
    departmentId?: string | null
    Center_Center_coordinatorIdToUser?: CenterUncheckedCreateNestedOneWithoutUser_Center_coordinatorIdToUserInput
    Claim_Claim_submittedByIdToUser?: ClaimUncheckedCreateNestedManyWithoutUser_Claim_submittedByIdToUserInput
    SupervisedStudent?: SupervisedStudentUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutClaim_Claim_processedByIdToUserInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutClaim_Claim_processedByIdToUserInput, UserUncheckedCreateWithoutClaim_Claim_processedByIdToUserInput>
  }

  export type UserCreateWithoutClaim_Claim_submittedByIdToUserInput = {
    id: string
    email: string
    name?: string | null
    password: string
    role: $Enums.User_role
    createdAt?: Date | string
    updatedAt: Date | string
    Center_Center_coordinatorIdToUser?: CenterCreateNestedOneWithoutUser_Center_coordinatorIdToUserInput
    Claim_Claim_processedByIdToUser?: ClaimCreateNestedManyWithoutUser_Claim_processedByIdToUserInput
    SupervisedStudent?: SupervisedStudentCreateNestedManyWithoutUserInput
    Department?: DepartmentCreateNestedOneWithoutUserInput
    Center_User_lecturerCenterIdToCenter?: CenterCreateNestedOneWithoutUser_User_lecturerCenterIdToCenterInput
  }

  export type UserUncheckedCreateWithoutClaim_Claim_submittedByIdToUserInput = {
    id: string
    email: string
    name?: string | null
    password: string
    role: $Enums.User_role
    createdAt?: Date | string
    updatedAt: Date | string
    lecturerCenterId?: string | null
    departmentId?: string | null
    Center_Center_coordinatorIdToUser?: CenterUncheckedCreateNestedOneWithoutUser_Center_coordinatorIdToUserInput
    Claim_Claim_processedByIdToUser?: ClaimUncheckedCreateNestedManyWithoutUser_Claim_processedByIdToUserInput
    SupervisedStudent?: SupervisedStudentUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutClaim_Claim_submittedByIdToUserInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutClaim_Claim_submittedByIdToUserInput, UserUncheckedCreateWithoutClaim_Claim_submittedByIdToUserInput>
  }

  export type SupervisedStudentCreateWithoutClaimInput = {
    id: string
    studentName: string
    thesisTitle: string
    User: UserCreateNestedOneWithoutSupervisedStudentInput
  }

  export type SupervisedStudentUncheckedCreateWithoutClaimInput = {
    id: string
    studentName: string
    thesisTitle: string
    supervisorId: string
  }

  export type SupervisedStudentCreateOrConnectWithoutClaimInput = {
    where: SupervisedStudentWhereUniqueInput
    create: XOR<SupervisedStudentCreateWithoutClaimInput, SupervisedStudentUncheckedCreateWithoutClaimInput>
  }

  export type SupervisedStudentCreateManyClaimInputEnvelope = {
    data: SupervisedStudentCreateManyClaimInput | SupervisedStudentCreateManyClaimInput[]
    skipDuplicates?: boolean
  }

  export type CenterUpsertWithoutClaimInput = {
    update: XOR<CenterUpdateWithoutClaimInput, CenterUncheckedUpdateWithoutClaimInput>
    create: XOR<CenterCreateWithoutClaimInput, CenterUncheckedCreateWithoutClaimInput>
    where?: CenterWhereInput
  }

  export type CenterUpdateToOneWithWhereWithoutClaimInput = {
    where?: CenterWhereInput
    data: XOR<CenterUpdateWithoutClaimInput, CenterUncheckedUpdateWithoutClaimInput>
  }

  export type CenterUpdateWithoutClaimInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    User_Center_coordinatorIdToUser?: UserUpdateOneRequiredWithoutCenter_Center_coordinatorIdToUserNestedInput
    Department?: DepartmentUpdateManyWithoutCenterNestedInput
    User_User_lecturerCenterIdToCenter?: UserUpdateManyWithoutCenter_User_lecturerCenterIdToCenterNestedInput
  }

  export type CenterUncheckedUpdateWithoutClaimInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    coordinatorId?: StringFieldUpdateOperationsInput | string
    Department?: DepartmentUncheckedUpdateManyWithoutCenterNestedInput
    User_User_lecturerCenterIdToCenter?: UserUncheckedUpdateManyWithoutCenter_User_lecturerCenterIdToCenterNestedInput
  }

  export type UserUpsertWithoutClaim_Claim_processedByIdToUserInput = {
    update: XOR<UserUpdateWithoutClaim_Claim_processedByIdToUserInput, UserUncheckedUpdateWithoutClaim_Claim_processedByIdToUserInput>
    create: XOR<UserCreateWithoutClaim_Claim_processedByIdToUserInput, UserUncheckedCreateWithoutClaim_Claim_processedByIdToUserInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutClaim_Claim_processedByIdToUserInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutClaim_Claim_processedByIdToUserInput, UserUncheckedUpdateWithoutClaim_Claim_processedByIdToUserInput>
  }

  export type UserUpdateWithoutClaim_Claim_processedByIdToUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUser_roleFieldUpdateOperationsInput | $Enums.User_role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Center_Center_coordinatorIdToUser?: CenterUpdateOneWithoutUser_Center_coordinatorIdToUserNestedInput
    Claim_Claim_submittedByIdToUser?: ClaimUpdateManyWithoutUser_Claim_submittedByIdToUserNestedInput
    SupervisedStudent?: SupervisedStudentUpdateManyWithoutUserNestedInput
    Department?: DepartmentUpdateOneWithoutUserNestedInput
    Center_User_lecturerCenterIdToCenter?: CenterUpdateOneWithoutUser_User_lecturerCenterIdToCenterNestedInput
  }

  export type UserUncheckedUpdateWithoutClaim_Claim_processedByIdToUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUser_roleFieldUpdateOperationsInput | $Enums.User_role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lecturerCenterId?: NullableStringFieldUpdateOperationsInput | string | null
    departmentId?: NullableStringFieldUpdateOperationsInput | string | null
    Center_Center_coordinatorIdToUser?: CenterUncheckedUpdateOneWithoutUser_Center_coordinatorIdToUserNestedInput
    Claim_Claim_submittedByIdToUser?: ClaimUncheckedUpdateManyWithoutUser_Claim_submittedByIdToUserNestedInput
    SupervisedStudent?: SupervisedStudentUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserUpsertWithoutClaim_Claim_submittedByIdToUserInput = {
    update: XOR<UserUpdateWithoutClaim_Claim_submittedByIdToUserInput, UserUncheckedUpdateWithoutClaim_Claim_submittedByIdToUserInput>
    create: XOR<UserCreateWithoutClaim_Claim_submittedByIdToUserInput, UserUncheckedCreateWithoutClaim_Claim_submittedByIdToUserInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutClaim_Claim_submittedByIdToUserInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutClaim_Claim_submittedByIdToUserInput, UserUncheckedUpdateWithoutClaim_Claim_submittedByIdToUserInput>
  }

  export type UserUpdateWithoutClaim_Claim_submittedByIdToUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUser_roleFieldUpdateOperationsInput | $Enums.User_role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Center_Center_coordinatorIdToUser?: CenterUpdateOneWithoutUser_Center_coordinatorIdToUserNestedInput
    Claim_Claim_processedByIdToUser?: ClaimUpdateManyWithoutUser_Claim_processedByIdToUserNestedInput
    SupervisedStudent?: SupervisedStudentUpdateManyWithoutUserNestedInput
    Department?: DepartmentUpdateOneWithoutUserNestedInput
    Center_User_lecturerCenterIdToCenter?: CenterUpdateOneWithoutUser_User_lecturerCenterIdToCenterNestedInput
  }

  export type UserUncheckedUpdateWithoutClaim_Claim_submittedByIdToUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUser_roleFieldUpdateOperationsInput | $Enums.User_role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lecturerCenterId?: NullableStringFieldUpdateOperationsInput | string | null
    departmentId?: NullableStringFieldUpdateOperationsInput | string | null
    Center_Center_coordinatorIdToUser?: CenterUncheckedUpdateOneWithoutUser_Center_coordinatorIdToUserNestedInput
    Claim_Claim_processedByIdToUser?: ClaimUncheckedUpdateManyWithoutUser_Claim_processedByIdToUserNestedInput
    SupervisedStudent?: SupervisedStudentUncheckedUpdateManyWithoutUserNestedInput
  }

  export type SupervisedStudentUpsertWithWhereUniqueWithoutClaimInput = {
    where: SupervisedStudentWhereUniqueInput
    update: XOR<SupervisedStudentUpdateWithoutClaimInput, SupervisedStudentUncheckedUpdateWithoutClaimInput>
    create: XOR<SupervisedStudentCreateWithoutClaimInput, SupervisedStudentUncheckedCreateWithoutClaimInput>
  }

  export type SupervisedStudentUpdateWithWhereUniqueWithoutClaimInput = {
    where: SupervisedStudentWhereUniqueInput
    data: XOR<SupervisedStudentUpdateWithoutClaimInput, SupervisedStudentUncheckedUpdateWithoutClaimInput>
  }

  export type SupervisedStudentUpdateManyWithWhereWithoutClaimInput = {
    where: SupervisedStudentScalarWhereInput
    data: XOR<SupervisedStudentUpdateManyMutationInput, SupervisedStudentUncheckedUpdateManyWithoutClaimInput>
  }

  export type SupervisedStudentScalarWhereInput = {
    AND?: SupervisedStudentScalarWhereInput | SupervisedStudentScalarWhereInput[]
    OR?: SupervisedStudentScalarWhereInput[]
    NOT?: SupervisedStudentScalarWhereInput | SupervisedStudentScalarWhereInput[]
    id?: StringFilter<"SupervisedStudent"> | string
    studentName?: StringFilter<"SupervisedStudent"> | string
    thesisTitle?: StringFilter<"SupervisedStudent"> | string
    claimId?: StringFilter<"SupervisedStudent"> | string
    supervisorId?: StringFilter<"SupervisedStudent"> | string
  }

  export type CenterCreateWithoutDepartmentInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt: Date | string
    User_Center_coordinatorIdToUser: UserCreateNestedOneWithoutCenter_Center_coordinatorIdToUserInput
    Claim?: ClaimCreateNestedManyWithoutCenterInput
    User_User_lecturerCenterIdToCenter?: UserCreateNestedManyWithoutCenter_User_lecturerCenterIdToCenterInput
  }

  export type CenterUncheckedCreateWithoutDepartmentInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt: Date | string
    coordinatorId: string
    Claim?: ClaimUncheckedCreateNestedManyWithoutCenterInput
    User_User_lecturerCenterIdToCenter?: UserUncheckedCreateNestedManyWithoutCenter_User_lecturerCenterIdToCenterInput
  }

  export type CenterCreateOrConnectWithoutDepartmentInput = {
    where: CenterWhereUniqueInput
    create: XOR<CenterCreateWithoutDepartmentInput, CenterUncheckedCreateWithoutDepartmentInput>
  }

  export type UserCreateWithoutDepartmentInput = {
    id: string
    email: string
    name?: string | null
    password: string
    role: $Enums.User_role
    createdAt?: Date | string
    updatedAt: Date | string
    Center_Center_coordinatorIdToUser?: CenterCreateNestedOneWithoutUser_Center_coordinatorIdToUserInput
    Claim_Claim_processedByIdToUser?: ClaimCreateNestedManyWithoutUser_Claim_processedByIdToUserInput
    Claim_Claim_submittedByIdToUser?: ClaimCreateNestedManyWithoutUser_Claim_submittedByIdToUserInput
    SupervisedStudent?: SupervisedStudentCreateNestedManyWithoutUserInput
    Center_User_lecturerCenterIdToCenter?: CenterCreateNestedOneWithoutUser_User_lecturerCenterIdToCenterInput
  }

  export type UserUncheckedCreateWithoutDepartmentInput = {
    id: string
    email: string
    name?: string | null
    password: string
    role: $Enums.User_role
    createdAt?: Date | string
    updatedAt: Date | string
    lecturerCenterId?: string | null
    Center_Center_coordinatorIdToUser?: CenterUncheckedCreateNestedOneWithoutUser_Center_coordinatorIdToUserInput
    Claim_Claim_processedByIdToUser?: ClaimUncheckedCreateNestedManyWithoutUser_Claim_processedByIdToUserInput
    Claim_Claim_submittedByIdToUser?: ClaimUncheckedCreateNestedManyWithoutUser_Claim_submittedByIdToUserInput
    SupervisedStudent?: SupervisedStudentUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutDepartmentInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutDepartmentInput, UserUncheckedCreateWithoutDepartmentInput>
  }

  export type UserCreateManyDepartmentInputEnvelope = {
    data: UserCreateManyDepartmentInput | UserCreateManyDepartmentInput[]
    skipDuplicates?: boolean
  }

  export type CenterUpsertWithoutDepartmentInput = {
    update: XOR<CenterUpdateWithoutDepartmentInput, CenterUncheckedUpdateWithoutDepartmentInput>
    create: XOR<CenterCreateWithoutDepartmentInput, CenterUncheckedCreateWithoutDepartmentInput>
    where?: CenterWhereInput
  }

  export type CenterUpdateToOneWithWhereWithoutDepartmentInput = {
    where?: CenterWhereInput
    data: XOR<CenterUpdateWithoutDepartmentInput, CenterUncheckedUpdateWithoutDepartmentInput>
  }

  export type CenterUpdateWithoutDepartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    User_Center_coordinatorIdToUser?: UserUpdateOneRequiredWithoutCenter_Center_coordinatorIdToUserNestedInput
    Claim?: ClaimUpdateManyWithoutCenterNestedInput
    User_User_lecturerCenterIdToCenter?: UserUpdateManyWithoutCenter_User_lecturerCenterIdToCenterNestedInput
  }

  export type CenterUncheckedUpdateWithoutDepartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    coordinatorId?: StringFieldUpdateOperationsInput | string
    Claim?: ClaimUncheckedUpdateManyWithoutCenterNestedInput
    User_User_lecturerCenterIdToCenter?: UserUncheckedUpdateManyWithoutCenter_User_lecturerCenterIdToCenterNestedInput
  }

  export type UserUpsertWithWhereUniqueWithoutDepartmentInput = {
    where: UserWhereUniqueInput
    update: XOR<UserUpdateWithoutDepartmentInput, UserUncheckedUpdateWithoutDepartmentInput>
    create: XOR<UserCreateWithoutDepartmentInput, UserUncheckedCreateWithoutDepartmentInput>
  }

  export type UserUpdateWithWhereUniqueWithoutDepartmentInput = {
    where: UserWhereUniqueInput
    data: XOR<UserUpdateWithoutDepartmentInput, UserUncheckedUpdateWithoutDepartmentInput>
  }

  export type UserUpdateManyWithWhereWithoutDepartmentInput = {
    where: UserScalarWhereInput
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyWithoutDepartmentInput>
  }

  export type ClaimCreateWithoutSupervisedStudentInput = {
    id: string
    claimType: $Enums.Claim_claimType
    status?: $Enums.Claim_status
    submittedAt?: Date | string
    updatedAt: Date | string
    processedAt?: Date | string | null
    teachingDate?: Date | string | null
    teachingStartTime?: string | null
    teachingEndTime?: string | null
    teachingHours?: number | null
    transportType?: $Enums.Claim_transportType | null
    transportDestinationTo?: string | null
    transportDestinationFrom?: string | null
    transportRegNumber?: string | null
    transportCubicCapacity?: number | null
    transportAmount?: number | null
    thesisType?: $Enums.Claim_thesisType | null
    thesisSupervisionRank?: $Enums.Claim_thesisSupervisionRank | null
    thesisExamCourseCode?: string | null
    thesisExamDate?: Date | string | null
    Center: CenterCreateNestedOneWithoutClaimInput
    User_Claim_processedByIdToUser?: UserCreateNestedOneWithoutClaim_Claim_processedByIdToUserInput
    User_Claim_submittedByIdToUser: UserCreateNestedOneWithoutClaim_Claim_submittedByIdToUserInput
  }

  export type ClaimUncheckedCreateWithoutSupervisedStudentInput = {
    id: string
    claimType: $Enums.Claim_claimType
    status?: $Enums.Claim_status
    submittedAt?: Date | string
    updatedAt: Date | string
    processedAt?: Date | string | null
    submittedById: string
    centerId: string
    processedById?: string | null
    teachingDate?: Date | string | null
    teachingStartTime?: string | null
    teachingEndTime?: string | null
    teachingHours?: number | null
    transportType?: $Enums.Claim_transportType | null
    transportDestinationTo?: string | null
    transportDestinationFrom?: string | null
    transportRegNumber?: string | null
    transportCubicCapacity?: number | null
    transportAmount?: number | null
    thesisType?: $Enums.Claim_thesisType | null
    thesisSupervisionRank?: $Enums.Claim_thesisSupervisionRank | null
    thesisExamCourseCode?: string | null
    thesisExamDate?: Date | string | null
  }

  export type ClaimCreateOrConnectWithoutSupervisedStudentInput = {
    where: ClaimWhereUniqueInput
    create: XOR<ClaimCreateWithoutSupervisedStudentInput, ClaimUncheckedCreateWithoutSupervisedStudentInput>
  }

  export type UserCreateWithoutSupervisedStudentInput = {
    id: string
    email: string
    name?: string | null
    password: string
    role: $Enums.User_role
    createdAt?: Date | string
    updatedAt: Date | string
    Center_Center_coordinatorIdToUser?: CenterCreateNestedOneWithoutUser_Center_coordinatorIdToUserInput
    Claim_Claim_processedByIdToUser?: ClaimCreateNestedManyWithoutUser_Claim_processedByIdToUserInput
    Claim_Claim_submittedByIdToUser?: ClaimCreateNestedManyWithoutUser_Claim_submittedByIdToUserInput
    Department?: DepartmentCreateNestedOneWithoutUserInput
    Center_User_lecturerCenterIdToCenter?: CenterCreateNestedOneWithoutUser_User_lecturerCenterIdToCenterInput
  }

  export type UserUncheckedCreateWithoutSupervisedStudentInput = {
    id: string
    email: string
    name?: string | null
    password: string
    role: $Enums.User_role
    createdAt?: Date | string
    updatedAt: Date | string
    lecturerCenterId?: string | null
    departmentId?: string | null
    Center_Center_coordinatorIdToUser?: CenterUncheckedCreateNestedOneWithoutUser_Center_coordinatorIdToUserInput
    Claim_Claim_processedByIdToUser?: ClaimUncheckedCreateNestedManyWithoutUser_Claim_processedByIdToUserInput
    Claim_Claim_submittedByIdToUser?: ClaimUncheckedCreateNestedManyWithoutUser_Claim_submittedByIdToUserInput
  }

  export type UserCreateOrConnectWithoutSupervisedStudentInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutSupervisedStudentInput, UserUncheckedCreateWithoutSupervisedStudentInput>
  }

  export type ClaimUpsertWithoutSupervisedStudentInput = {
    update: XOR<ClaimUpdateWithoutSupervisedStudentInput, ClaimUncheckedUpdateWithoutSupervisedStudentInput>
    create: XOR<ClaimCreateWithoutSupervisedStudentInput, ClaimUncheckedCreateWithoutSupervisedStudentInput>
    where?: ClaimWhereInput
  }

  export type ClaimUpdateToOneWithWhereWithoutSupervisedStudentInput = {
    where?: ClaimWhereInput
    data: XOR<ClaimUpdateWithoutSupervisedStudentInput, ClaimUncheckedUpdateWithoutSupervisedStudentInput>
  }

  export type ClaimUpdateWithoutSupervisedStudentInput = {
    id?: StringFieldUpdateOperationsInput | string
    claimType?: EnumClaim_claimTypeFieldUpdateOperationsInput | $Enums.Claim_claimType
    status?: EnumClaim_statusFieldUpdateOperationsInput | $Enums.Claim_status
    submittedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    teachingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    teachingStartTime?: NullableStringFieldUpdateOperationsInput | string | null
    teachingEndTime?: NullableStringFieldUpdateOperationsInput | string | null
    teachingHours?: NullableFloatFieldUpdateOperationsInput | number | null
    transportType?: NullableEnumClaim_transportTypeFieldUpdateOperationsInput | $Enums.Claim_transportType | null
    transportDestinationTo?: NullableStringFieldUpdateOperationsInput | string | null
    transportDestinationFrom?: NullableStringFieldUpdateOperationsInput | string | null
    transportRegNumber?: NullableStringFieldUpdateOperationsInput | string | null
    transportCubicCapacity?: NullableIntFieldUpdateOperationsInput | number | null
    transportAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    thesisType?: NullableEnumClaim_thesisTypeFieldUpdateOperationsInput | $Enums.Claim_thesisType | null
    thesisSupervisionRank?: NullableEnumClaim_thesisSupervisionRankFieldUpdateOperationsInput | $Enums.Claim_thesisSupervisionRank | null
    thesisExamCourseCode?: NullableStringFieldUpdateOperationsInput | string | null
    thesisExamDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Center?: CenterUpdateOneRequiredWithoutClaimNestedInput
    User_Claim_processedByIdToUser?: UserUpdateOneWithoutClaim_Claim_processedByIdToUserNestedInput
    User_Claim_submittedByIdToUser?: UserUpdateOneRequiredWithoutClaim_Claim_submittedByIdToUserNestedInput
  }

  export type ClaimUncheckedUpdateWithoutSupervisedStudentInput = {
    id?: StringFieldUpdateOperationsInput | string
    claimType?: EnumClaim_claimTypeFieldUpdateOperationsInput | $Enums.Claim_claimType
    status?: EnumClaim_statusFieldUpdateOperationsInput | $Enums.Claim_status
    submittedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    submittedById?: StringFieldUpdateOperationsInput | string
    centerId?: StringFieldUpdateOperationsInput | string
    processedById?: NullableStringFieldUpdateOperationsInput | string | null
    teachingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    teachingStartTime?: NullableStringFieldUpdateOperationsInput | string | null
    teachingEndTime?: NullableStringFieldUpdateOperationsInput | string | null
    teachingHours?: NullableFloatFieldUpdateOperationsInput | number | null
    transportType?: NullableEnumClaim_transportTypeFieldUpdateOperationsInput | $Enums.Claim_transportType | null
    transportDestinationTo?: NullableStringFieldUpdateOperationsInput | string | null
    transportDestinationFrom?: NullableStringFieldUpdateOperationsInput | string | null
    transportRegNumber?: NullableStringFieldUpdateOperationsInput | string | null
    transportCubicCapacity?: NullableIntFieldUpdateOperationsInput | number | null
    transportAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    thesisType?: NullableEnumClaim_thesisTypeFieldUpdateOperationsInput | $Enums.Claim_thesisType | null
    thesisSupervisionRank?: NullableEnumClaim_thesisSupervisionRankFieldUpdateOperationsInput | $Enums.Claim_thesisSupervisionRank | null
    thesisExamCourseCode?: NullableStringFieldUpdateOperationsInput | string | null
    thesisExamDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserUpsertWithoutSupervisedStudentInput = {
    update: XOR<UserUpdateWithoutSupervisedStudentInput, UserUncheckedUpdateWithoutSupervisedStudentInput>
    create: XOR<UserCreateWithoutSupervisedStudentInput, UserUncheckedCreateWithoutSupervisedStudentInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutSupervisedStudentInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutSupervisedStudentInput, UserUncheckedUpdateWithoutSupervisedStudentInput>
  }

  export type UserUpdateWithoutSupervisedStudentInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUser_roleFieldUpdateOperationsInput | $Enums.User_role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Center_Center_coordinatorIdToUser?: CenterUpdateOneWithoutUser_Center_coordinatorIdToUserNestedInput
    Claim_Claim_processedByIdToUser?: ClaimUpdateManyWithoutUser_Claim_processedByIdToUserNestedInput
    Claim_Claim_submittedByIdToUser?: ClaimUpdateManyWithoutUser_Claim_submittedByIdToUserNestedInput
    Department?: DepartmentUpdateOneWithoutUserNestedInput
    Center_User_lecturerCenterIdToCenter?: CenterUpdateOneWithoutUser_User_lecturerCenterIdToCenterNestedInput
  }

  export type UserUncheckedUpdateWithoutSupervisedStudentInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUser_roleFieldUpdateOperationsInput | $Enums.User_role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lecturerCenterId?: NullableStringFieldUpdateOperationsInput | string | null
    departmentId?: NullableStringFieldUpdateOperationsInput | string | null
    Center_Center_coordinatorIdToUser?: CenterUncheckedUpdateOneWithoutUser_Center_coordinatorIdToUserNestedInput
    Claim_Claim_processedByIdToUser?: ClaimUncheckedUpdateManyWithoutUser_Claim_processedByIdToUserNestedInput
    Claim_Claim_submittedByIdToUser?: ClaimUncheckedUpdateManyWithoutUser_Claim_submittedByIdToUserNestedInput
  }

  export type CenterCreateWithoutUser_Center_coordinatorIdToUserInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt: Date | string
    Claim?: ClaimCreateNestedManyWithoutCenterInput
    Department?: DepartmentCreateNestedManyWithoutCenterInput
    User_User_lecturerCenterIdToCenter?: UserCreateNestedManyWithoutCenter_User_lecturerCenterIdToCenterInput
  }

  export type CenterUncheckedCreateWithoutUser_Center_coordinatorIdToUserInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt: Date | string
    Claim?: ClaimUncheckedCreateNestedManyWithoutCenterInput
    Department?: DepartmentUncheckedCreateNestedManyWithoutCenterInput
    User_User_lecturerCenterIdToCenter?: UserUncheckedCreateNestedManyWithoutCenter_User_lecturerCenterIdToCenterInput
  }

  export type CenterCreateOrConnectWithoutUser_Center_coordinatorIdToUserInput = {
    where: CenterWhereUniqueInput
    create: XOR<CenterCreateWithoutUser_Center_coordinatorIdToUserInput, CenterUncheckedCreateWithoutUser_Center_coordinatorIdToUserInput>
  }

  export type ClaimCreateWithoutUser_Claim_processedByIdToUserInput = {
    id: string
    claimType: $Enums.Claim_claimType
    status?: $Enums.Claim_status
    submittedAt?: Date | string
    updatedAt: Date | string
    processedAt?: Date | string | null
    teachingDate?: Date | string | null
    teachingStartTime?: string | null
    teachingEndTime?: string | null
    teachingHours?: number | null
    transportType?: $Enums.Claim_transportType | null
    transportDestinationTo?: string | null
    transportDestinationFrom?: string | null
    transportRegNumber?: string | null
    transportCubicCapacity?: number | null
    transportAmount?: number | null
    thesisType?: $Enums.Claim_thesisType | null
    thesisSupervisionRank?: $Enums.Claim_thesisSupervisionRank | null
    thesisExamCourseCode?: string | null
    thesisExamDate?: Date | string | null
    Center: CenterCreateNestedOneWithoutClaimInput
    User_Claim_submittedByIdToUser: UserCreateNestedOneWithoutClaim_Claim_submittedByIdToUserInput
    SupervisedStudent?: SupervisedStudentCreateNestedManyWithoutClaimInput
  }

  export type ClaimUncheckedCreateWithoutUser_Claim_processedByIdToUserInput = {
    id: string
    claimType: $Enums.Claim_claimType
    status?: $Enums.Claim_status
    submittedAt?: Date | string
    updatedAt: Date | string
    processedAt?: Date | string | null
    submittedById: string
    centerId: string
    teachingDate?: Date | string | null
    teachingStartTime?: string | null
    teachingEndTime?: string | null
    teachingHours?: number | null
    transportType?: $Enums.Claim_transportType | null
    transportDestinationTo?: string | null
    transportDestinationFrom?: string | null
    transportRegNumber?: string | null
    transportCubicCapacity?: number | null
    transportAmount?: number | null
    thesisType?: $Enums.Claim_thesisType | null
    thesisSupervisionRank?: $Enums.Claim_thesisSupervisionRank | null
    thesisExamCourseCode?: string | null
    thesisExamDate?: Date | string | null
    SupervisedStudent?: SupervisedStudentUncheckedCreateNestedManyWithoutClaimInput
  }

  export type ClaimCreateOrConnectWithoutUser_Claim_processedByIdToUserInput = {
    where: ClaimWhereUniqueInput
    create: XOR<ClaimCreateWithoutUser_Claim_processedByIdToUserInput, ClaimUncheckedCreateWithoutUser_Claim_processedByIdToUserInput>
  }

  export type ClaimCreateManyUser_Claim_processedByIdToUserInputEnvelope = {
    data: ClaimCreateManyUser_Claim_processedByIdToUserInput | ClaimCreateManyUser_Claim_processedByIdToUserInput[]
    skipDuplicates?: boolean
  }

  export type ClaimCreateWithoutUser_Claim_submittedByIdToUserInput = {
    id: string
    claimType: $Enums.Claim_claimType
    status?: $Enums.Claim_status
    submittedAt?: Date | string
    updatedAt: Date | string
    processedAt?: Date | string | null
    teachingDate?: Date | string | null
    teachingStartTime?: string | null
    teachingEndTime?: string | null
    teachingHours?: number | null
    transportType?: $Enums.Claim_transportType | null
    transportDestinationTo?: string | null
    transportDestinationFrom?: string | null
    transportRegNumber?: string | null
    transportCubicCapacity?: number | null
    transportAmount?: number | null
    thesisType?: $Enums.Claim_thesisType | null
    thesisSupervisionRank?: $Enums.Claim_thesisSupervisionRank | null
    thesisExamCourseCode?: string | null
    thesisExamDate?: Date | string | null
    Center: CenterCreateNestedOneWithoutClaimInput
    User_Claim_processedByIdToUser?: UserCreateNestedOneWithoutClaim_Claim_processedByIdToUserInput
    SupervisedStudent?: SupervisedStudentCreateNestedManyWithoutClaimInput
  }

  export type ClaimUncheckedCreateWithoutUser_Claim_submittedByIdToUserInput = {
    id: string
    claimType: $Enums.Claim_claimType
    status?: $Enums.Claim_status
    submittedAt?: Date | string
    updatedAt: Date | string
    processedAt?: Date | string | null
    centerId: string
    processedById?: string | null
    teachingDate?: Date | string | null
    teachingStartTime?: string | null
    teachingEndTime?: string | null
    teachingHours?: number | null
    transportType?: $Enums.Claim_transportType | null
    transportDestinationTo?: string | null
    transportDestinationFrom?: string | null
    transportRegNumber?: string | null
    transportCubicCapacity?: number | null
    transportAmount?: number | null
    thesisType?: $Enums.Claim_thesisType | null
    thesisSupervisionRank?: $Enums.Claim_thesisSupervisionRank | null
    thesisExamCourseCode?: string | null
    thesisExamDate?: Date | string | null
    SupervisedStudent?: SupervisedStudentUncheckedCreateNestedManyWithoutClaimInput
  }

  export type ClaimCreateOrConnectWithoutUser_Claim_submittedByIdToUserInput = {
    where: ClaimWhereUniqueInput
    create: XOR<ClaimCreateWithoutUser_Claim_submittedByIdToUserInput, ClaimUncheckedCreateWithoutUser_Claim_submittedByIdToUserInput>
  }

  export type ClaimCreateManyUser_Claim_submittedByIdToUserInputEnvelope = {
    data: ClaimCreateManyUser_Claim_submittedByIdToUserInput | ClaimCreateManyUser_Claim_submittedByIdToUserInput[]
    skipDuplicates?: boolean
  }

  export type SupervisedStudentCreateWithoutUserInput = {
    id: string
    studentName: string
    thesisTitle: string
    Claim: ClaimCreateNestedOneWithoutSupervisedStudentInput
  }

  export type SupervisedStudentUncheckedCreateWithoutUserInput = {
    id: string
    studentName: string
    thesisTitle: string
    claimId: string
  }

  export type SupervisedStudentCreateOrConnectWithoutUserInput = {
    where: SupervisedStudentWhereUniqueInput
    create: XOR<SupervisedStudentCreateWithoutUserInput, SupervisedStudentUncheckedCreateWithoutUserInput>
  }

  export type SupervisedStudentCreateManyUserInputEnvelope = {
    data: SupervisedStudentCreateManyUserInput | SupervisedStudentCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type DepartmentCreateWithoutUserInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt: Date | string
    Center: CenterCreateNestedOneWithoutDepartmentInput
  }

  export type DepartmentUncheckedCreateWithoutUserInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt: Date | string
    centerId: string
  }

  export type DepartmentCreateOrConnectWithoutUserInput = {
    where: DepartmentWhereUniqueInput
    create: XOR<DepartmentCreateWithoutUserInput, DepartmentUncheckedCreateWithoutUserInput>
  }

  export type CenterCreateWithoutUser_User_lecturerCenterIdToCenterInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt: Date | string
    User_Center_coordinatorIdToUser: UserCreateNestedOneWithoutCenter_Center_coordinatorIdToUserInput
    Claim?: ClaimCreateNestedManyWithoutCenterInput
    Department?: DepartmentCreateNestedManyWithoutCenterInput
  }

  export type CenterUncheckedCreateWithoutUser_User_lecturerCenterIdToCenterInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt: Date | string
    coordinatorId: string
    Claim?: ClaimUncheckedCreateNestedManyWithoutCenterInput
    Department?: DepartmentUncheckedCreateNestedManyWithoutCenterInput
  }

  export type CenterCreateOrConnectWithoutUser_User_lecturerCenterIdToCenterInput = {
    where: CenterWhereUniqueInput
    create: XOR<CenterCreateWithoutUser_User_lecturerCenterIdToCenterInput, CenterUncheckedCreateWithoutUser_User_lecturerCenterIdToCenterInput>
  }

  export type CenterUpsertWithoutUser_Center_coordinatorIdToUserInput = {
    update: XOR<CenterUpdateWithoutUser_Center_coordinatorIdToUserInput, CenterUncheckedUpdateWithoutUser_Center_coordinatorIdToUserInput>
    create: XOR<CenterCreateWithoutUser_Center_coordinatorIdToUserInput, CenterUncheckedCreateWithoutUser_Center_coordinatorIdToUserInput>
    where?: CenterWhereInput
  }

  export type CenterUpdateToOneWithWhereWithoutUser_Center_coordinatorIdToUserInput = {
    where?: CenterWhereInput
    data: XOR<CenterUpdateWithoutUser_Center_coordinatorIdToUserInput, CenterUncheckedUpdateWithoutUser_Center_coordinatorIdToUserInput>
  }

  export type CenterUpdateWithoutUser_Center_coordinatorIdToUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Claim?: ClaimUpdateManyWithoutCenterNestedInput
    Department?: DepartmentUpdateManyWithoutCenterNestedInput
    User_User_lecturerCenterIdToCenter?: UserUpdateManyWithoutCenter_User_lecturerCenterIdToCenterNestedInput
  }

  export type CenterUncheckedUpdateWithoutUser_Center_coordinatorIdToUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Claim?: ClaimUncheckedUpdateManyWithoutCenterNestedInput
    Department?: DepartmentUncheckedUpdateManyWithoutCenterNestedInput
    User_User_lecturerCenterIdToCenter?: UserUncheckedUpdateManyWithoutCenter_User_lecturerCenterIdToCenterNestedInput
  }

  export type ClaimUpsertWithWhereUniqueWithoutUser_Claim_processedByIdToUserInput = {
    where: ClaimWhereUniqueInput
    update: XOR<ClaimUpdateWithoutUser_Claim_processedByIdToUserInput, ClaimUncheckedUpdateWithoutUser_Claim_processedByIdToUserInput>
    create: XOR<ClaimCreateWithoutUser_Claim_processedByIdToUserInput, ClaimUncheckedCreateWithoutUser_Claim_processedByIdToUserInput>
  }

  export type ClaimUpdateWithWhereUniqueWithoutUser_Claim_processedByIdToUserInput = {
    where: ClaimWhereUniqueInput
    data: XOR<ClaimUpdateWithoutUser_Claim_processedByIdToUserInput, ClaimUncheckedUpdateWithoutUser_Claim_processedByIdToUserInput>
  }

  export type ClaimUpdateManyWithWhereWithoutUser_Claim_processedByIdToUserInput = {
    where: ClaimScalarWhereInput
    data: XOR<ClaimUpdateManyMutationInput, ClaimUncheckedUpdateManyWithoutUser_Claim_processedByIdToUserInput>
  }

  export type ClaimUpsertWithWhereUniqueWithoutUser_Claim_submittedByIdToUserInput = {
    where: ClaimWhereUniqueInput
    update: XOR<ClaimUpdateWithoutUser_Claim_submittedByIdToUserInput, ClaimUncheckedUpdateWithoutUser_Claim_submittedByIdToUserInput>
    create: XOR<ClaimCreateWithoutUser_Claim_submittedByIdToUserInput, ClaimUncheckedCreateWithoutUser_Claim_submittedByIdToUserInput>
  }

  export type ClaimUpdateWithWhereUniqueWithoutUser_Claim_submittedByIdToUserInput = {
    where: ClaimWhereUniqueInput
    data: XOR<ClaimUpdateWithoutUser_Claim_submittedByIdToUserInput, ClaimUncheckedUpdateWithoutUser_Claim_submittedByIdToUserInput>
  }

  export type ClaimUpdateManyWithWhereWithoutUser_Claim_submittedByIdToUserInput = {
    where: ClaimScalarWhereInput
    data: XOR<ClaimUpdateManyMutationInput, ClaimUncheckedUpdateManyWithoutUser_Claim_submittedByIdToUserInput>
  }

  export type SupervisedStudentUpsertWithWhereUniqueWithoutUserInput = {
    where: SupervisedStudentWhereUniqueInput
    update: XOR<SupervisedStudentUpdateWithoutUserInput, SupervisedStudentUncheckedUpdateWithoutUserInput>
    create: XOR<SupervisedStudentCreateWithoutUserInput, SupervisedStudentUncheckedCreateWithoutUserInput>
  }

  export type SupervisedStudentUpdateWithWhereUniqueWithoutUserInput = {
    where: SupervisedStudentWhereUniqueInput
    data: XOR<SupervisedStudentUpdateWithoutUserInput, SupervisedStudentUncheckedUpdateWithoutUserInput>
  }

  export type SupervisedStudentUpdateManyWithWhereWithoutUserInput = {
    where: SupervisedStudentScalarWhereInput
    data: XOR<SupervisedStudentUpdateManyMutationInput, SupervisedStudentUncheckedUpdateManyWithoutUserInput>
  }

  export type DepartmentUpsertWithoutUserInput = {
    update: XOR<DepartmentUpdateWithoutUserInput, DepartmentUncheckedUpdateWithoutUserInput>
    create: XOR<DepartmentCreateWithoutUserInput, DepartmentUncheckedCreateWithoutUserInput>
    where?: DepartmentWhereInput
  }

  export type DepartmentUpdateToOneWithWhereWithoutUserInput = {
    where?: DepartmentWhereInput
    data: XOR<DepartmentUpdateWithoutUserInput, DepartmentUncheckedUpdateWithoutUserInput>
  }

  export type DepartmentUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Center?: CenterUpdateOneRequiredWithoutDepartmentNestedInput
  }

  export type DepartmentUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    centerId?: StringFieldUpdateOperationsInput | string
  }

  export type CenterUpsertWithoutUser_User_lecturerCenterIdToCenterInput = {
    update: XOR<CenterUpdateWithoutUser_User_lecturerCenterIdToCenterInput, CenterUncheckedUpdateWithoutUser_User_lecturerCenterIdToCenterInput>
    create: XOR<CenterCreateWithoutUser_User_lecturerCenterIdToCenterInput, CenterUncheckedCreateWithoutUser_User_lecturerCenterIdToCenterInput>
    where?: CenterWhereInput
  }

  export type CenterUpdateToOneWithWhereWithoutUser_User_lecturerCenterIdToCenterInput = {
    where?: CenterWhereInput
    data: XOR<CenterUpdateWithoutUser_User_lecturerCenterIdToCenterInput, CenterUncheckedUpdateWithoutUser_User_lecturerCenterIdToCenterInput>
  }

  export type CenterUpdateWithoutUser_User_lecturerCenterIdToCenterInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    User_Center_coordinatorIdToUser?: UserUpdateOneRequiredWithoutCenter_Center_coordinatorIdToUserNestedInput
    Claim?: ClaimUpdateManyWithoutCenterNestedInput
    Department?: DepartmentUpdateManyWithoutCenterNestedInput
  }

  export type CenterUncheckedUpdateWithoutUser_User_lecturerCenterIdToCenterInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    coordinatorId?: StringFieldUpdateOperationsInput | string
    Claim?: ClaimUncheckedUpdateManyWithoutCenterNestedInput
    Department?: DepartmentUncheckedUpdateManyWithoutCenterNestedInput
  }

  export type ClaimCreateManyCenterInput = {
    id: string
    claimType: $Enums.Claim_claimType
    status?: $Enums.Claim_status
    submittedAt?: Date | string
    updatedAt: Date | string
    processedAt?: Date | string | null
    submittedById: string
    processedById?: string | null
    teachingDate?: Date | string | null
    teachingStartTime?: string | null
    teachingEndTime?: string | null
    teachingHours?: number | null
    transportType?: $Enums.Claim_transportType | null
    transportDestinationTo?: string | null
    transportDestinationFrom?: string | null
    transportRegNumber?: string | null
    transportCubicCapacity?: number | null
    transportAmount?: number | null
    thesisType?: $Enums.Claim_thesisType | null
    thesisSupervisionRank?: $Enums.Claim_thesisSupervisionRank | null
    thesisExamCourseCode?: string | null
    thesisExamDate?: Date | string | null
  }

  export type DepartmentCreateManyCenterInput = {
    id: string
    name: string
    createdAt?: Date | string
    updatedAt: Date | string
  }

  export type UserCreateManyCenter_User_lecturerCenterIdToCenterInput = {
    id: string
    email: string
    name?: string | null
    password: string
    role: $Enums.User_role
    createdAt?: Date | string
    updatedAt: Date | string
    departmentId?: string | null
  }

  export type ClaimUpdateWithoutCenterInput = {
    id?: StringFieldUpdateOperationsInput | string
    claimType?: EnumClaim_claimTypeFieldUpdateOperationsInput | $Enums.Claim_claimType
    status?: EnumClaim_statusFieldUpdateOperationsInput | $Enums.Claim_status
    submittedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    teachingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    teachingStartTime?: NullableStringFieldUpdateOperationsInput | string | null
    teachingEndTime?: NullableStringFieldUpdateOperationsInput | string | null
    teachingHours?: NullableFloatFieldUpdateOperationsInput | number | null
    transportType?: NullableEnumClaim_transportTypeFieldUpdateOperationsInput | $Enums.Claim_transportType | null
    transportDestinationTo?: NullableStringFieldUpdateOperationsInput | string | null
    transportDestinationFrom?: NullableStringFieldUpdateOperationsInput | string | null
    transportRegNumber?: NullableStringFieldUpdateOperationsInput | string | null
    transportCubicCapacity?: NullableIntFieldUpdateOperationsInput | number | null
    transportAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    thesisType?: NullableEnumClaim_thesisTypeFieldUpdateOperationsInput | $Enums.Claim_thesisType | null
    thesisSupervisionRank?: NullableEnumClaim_thesisSupervisionRankFieldUpdateOperationsInput | $Enums.Claim_thesisSupervisionRank | null
    thesisExamCourseCode?: NullableStringFieldUpdateOperationsInput | string | null
    thesisExamDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    User_Claim_processedByIdToUser?: UserUpdateOneWithoutClaim_Claim_processedByIdToUserNestedInput
    User_Claim_submittedByIdToUser?: UserUpdateOneRequiredWithoutClaim_Claim_submittedByIdToUserNestedInput
    SupervisedStudent?: SupervisedStudentUpdateManyWithoutClaimNestedInput
  }

  export type ClaimUncheckedUpdateWithoutCenterInput = {
    id?: StringFieldUpdateOperationsInput | string
    claimType?: EnumClaim_claimTypeFieldUpdateOperationsInput | $Enums.Claim_claimType
    status?: EnumClaim_statusFieldUpdateOperationsInput | $Enums.Claim_status
    submittedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    submittedById?: StringFieldUpdateOperationsInput | string
    processedById?: NullableStringFieldUpdateOperationsInput | string | null
    teachingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    teachingStartTime?: NullableStringFieldUpdateOperationsInput | string | null
    teachingEndTime?: NullableStringFieldUpdateOperationsInput | string | null
    teachingHours?: NullableFloatFieldUpdateOperationsInput | number | null
    transportType?: NullableEnumClaim_transportTypeFieldUpdateOperationsInput | $Enums.Claim_transportType | null
    transportDestinationTo?: NullableStringFieldUpdateOperationsInput | string | null
    transportDestinationFrom?: NullableStringFieldUpdateOperationsInput | string | null
    transportRegNumber?: NullableStringFieldUpdateOperationsInput | string | null
    transportCubicCapacity?: NullableIntFieldUpdateOperationsInput | number | null
    transportAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    thesisType?: NullableEnumClaim_thesisTypeFieldUpdateOperationsInput | $Enums.Claim_thesisType | null
    thesisSupervisionRank?: NullableEnumClaim_thesisSupervisionRankFieldUpdateOperationsInput | $Enums.Claim_thesisSupervisionRank | null
    thesisExamCourseCode?: NullableStringFieldUpdateOperationsInput | string | null
    thesisExamDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    SupervisedStudent?: SupervisedStudentUncheckedUpdateManyWithoutClaimNestedInput
  }

  export type ClaimUncheckedUpdateManyWithoutCenterInput = {
    id?: StringFieldUpdateOperationsInput | string
    claimType?: EnumClaim_claimTypeFieldUpdateOperationsInput | $Enums.Claim_claimType
    status?: EnumClaim_statusFieldUpdateOperationsInput | $Enums.Claim_status
    submittedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    submittedById?: StringFieldUpdateOperationsInput | string
    processedById?: NullableStringFieldUpdateOperationsInput | string | null
    teachingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    teachingStartTime?: NullableStringFieldUpdateOperationsInput | string | null
    teachingEndTime?: NullableStringFieldUpdateOperationsInput | string | null
    teachingHours?: NullableFloatFieldUpdateOperationsInput | number | null
    transportType?: NullableEnumClaim_transportTypeFieldUpdateOperationsInput | $Enums.Claim_transportType | null
    transportDestinationTo?: NullableStringFieldUpdateOperationsInput | string | null
    transportDestinationFrom?: NullableStringFieldUpdateOperationsInput | string | null
    transportRegNumber?: NullableStringFieldUpdateOperationsInput | string | null
    transportCubicCapacity?: NullableIntFieldUpdateOperationsInput | number | null
    transportAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    thesisType?: NullableEnumClaim_thesisTypeFieldUpdateOperationsInput | $Enums.Claim_thesisType | null
    thesisSupervisionRank?: NullableEnumClaim_thesisSupervisionRankFieldUpdateOperationsInput | $Enums.Claim_thesisSupervisionRank | null
    thesisExamCourseCode?: NullableStringFieldUpdateOperationsInput | string | null
    thesisExamDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DepartmentUpdateWithoutCenterInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    User?: UserUpdateManyWithoutDepartmentNestedInput
  }

  export type DepartmentUncheckedUpdateWithoutCenterInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    User?: UserUncheckedUpdateManyWithoutDepartmentNestedInput
  }

  export type DepartmentUncheckedUpdateManyWithoutCenterInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUpdateWithoutCenter_User_lecturerCenterIdToCenterInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUser_roleFieldUpdateOperationsInput | $Enums.User_role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Center_Center_coordinatorIdToUser?: CenterUpdateOneWithoutUser_Center_coordinatorIdToUserNestedInput
    Claim_Claim_processedByIdToUser?: ClaimUpdateManyWithoutUser_Claim_processedByIdToUserNestedInput
    Claim_Claim_submittedByIdToUser?: ClaimUpdateManyWithoutUser_Claim_submittedByIdToUserNestedInput
    SupervisedStudent?: SupervisedStudentUpdateManyWithoutUserNestedInput
    Department?: DepartmentUpdateOneWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutCenter_User_lecturerCenterIdToCenterInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUser_roleFieldUpdateOperationsInput | $Enums.User_role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    departmentId?: NullableStringFieldUpdateOperationsInput | string | null
    Center_Center_coordinatorIdToUser?: CenterUncheckedUpdateOneWithoutUser_Center_coordinatorIdToUserNestedInput
    Claim_Claim_processedByIdToUser?: ClaimUncheckedUpdateManyWithoutUser_Claim_processedByIdToUserNestedInput
    Claim_Claim_submittedByIdToUser?: ClaimUncheckedUpdateManyWithoutUser_Claim_submittedByIdToUserNestedInput
    SupervisedStudent?: SupervisedStudentUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateManyWithoutCenter_User_lecturerCenterIdToCenterInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUser_roleFieldUpdateOperationsInput | $Enums.User_role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    departmentId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SupervisedStudentCreateManyClaimInput = {
    id: string
    studentName: string
    thesisTitle: string
    supervisorId: string
  }

  export type SupervisedStudentUpdateWithoutClaimInput = {
    id?: StringFieldUpdateOperationsInput | string
    studentName?: StringFieldUpdateOperationsInput | string
    thesisTitle?: StringFieldUpdateOperationsInput | string
    User?: UserUpdateOneRequiredWithoutSupervisedStudentNestedInput
  }

  export type SupervisedStudentUncheckedUpdateWithoutClaimInput = {
    id?: StringFieldUpdateOperationsInput | string
    studentName?: StringFieldUpdateOperationsInput | string
    thesisTitle?: StringFieldUpdateOperationsInput | string
    supervisorId?: StringFieldUpdateOperationsInput | string
  }

  export type SupervisedStudentUncheckedUpdateManyWithoutClaimInput = {
    id?: StringFieldUpdateOperationsInput | string
    studentName?: StringFieldUpdateOperationsInput | string
    thesisTitle?: StringFieldUpdateOperationsInput | string
    supervisorId?: StringFieldUpdateOperationsInput | string
  }

  export type UserCreateManyDepartmentInput = {
    id: string
    email: string
    name?: string | null
    password: string
    role: $Enums.User_role
    createdAt?: Date | string
    updatedAt: Date | string
    lecturerCenterId?: string | null
  }

  export type UserUpdateWithoutDepartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUser_roleFieldUpdateOperationsInput | $Enums.User_role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    Center_Center_coordinatorIdToUser?: CenterUpdateOneWithoutUser_Center_coordinatorIdToUserNestedInput
    Claim_Claim_processedByIdToUser?: ClaimUpdateManyWithoutUser_Claim_processedByIdToUserNestedInput
    Claim_Claim_submittedByIdToUser?: ClaimUpdateManyWithoutUser_Claim_submittedByIdToUserNestedInput
    SupervisedStudent?: SupervisedStudentUpdateManyWithoutUserNestedInput
    Center_User_lecturerCenterIdToCenter?: CenterUpdateOneWithoutUser_User_lecturerCenterIdToCenterNestedInput
  }

  export type UserUncheckedUpdateWithoutDepartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUser_roleFieldUpdateOperationsInput | $Enums.User_role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lecturerCenterId?: NullableStringFieldUpdateOperationsInput | string | null
    Center_Center_coordinatorIdToUser?: CenterUncheckedUpdateOneWithoutUser_Center_coordinatorIdToUserNestedInput
    Claim_Claim_processedByIdToUser?: ClaimUncheckedUpdateManyWithoutUser_Claim_processedByIdToUserNestedInput
    Claim_Claim_submittedByIdToUser?: ClaimUncheckedUpdateManyWithoutUser_Claim_submittedByIdToUserNestedInput
    SupervisedStudent?: SupervisedStudentUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateManyWithoutDepartmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumUser_roleFieldUpdateOperationsInput | $Enums.User_role
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lecturerCenterId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ClaimCreateManyUser_Claim_processedByIdToUserInput = {
    id: string
    claimType: $Enums.Claim_claimType
    status?: $Enums.Claim_status
    submittedAt?: Date | string
    updatedAt: Date | string
    processedAt?: Date | string | null
    submittedById: string
    centerId: string
    teachingDate?: Date | string | null
    teachingStartTime?: string | null
    teachingEndTime?: string | null
    teachingHours?: number | null
    transportType?: $Enums.Claim_transportType | null
    transportDestinationTo?: string | null
    transportDestinationFrom?: string | null
    transportRegNumber?: string | null
    transportCubicCapacity?: number | null
    transportAmount?: number | null
    thesisType?: $Enums.Claim_thesisType | null
    thesisSupervisionRank?: $Enums.Claim_thesisSupervisionRank | null
    thesisExamCourseCode?: string | null
    thesisExamDate?: Date | string | null
  }

  export type ClaimCreateManyUser_Claim_submittedByIdToUserInput = {
    id: string
    claimType: $Enums.Claim_claimType
    status?: $Enums.Claim_status
    submittedAt?: Date | string
    updatedAt: Date | string
    processedAt?: Date | string | null
    centerId: string
    processedById?: string | null
    teachingDate?: Date | string | null
    teachingStartTime?: string | null
    teachingEndTime?: string | null
    teachingHours?: number | null
    transportType?: $Enums.Claim_transportType | null
    transportDestinationTo?: string | null
    transportDestinationFrom?: string | null
    transportRegNumber?: string | null
    transportCubicCapacity?: number | null
    transportAmount?: number | null
    thesisType?: $Enums.Claim_thesisType | null
    thesisSupervisionRank?: $Enums.Claim_thesisSupervisionRank | null
    thesisExamCourseCode?: string | null
    thesisExamDate?: Date | string | null
  }

  export type SupervisedStudentCreateManyUserInput = {
    id: string
    studentName: string
    thesisTitle: string
    claimId: string
  }

  export type ClaimUpdateWithoutUser_Claim_processedByIdToUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    claimType?: EnumClaim_claimTypeFieldUpdateOperationsInput | $Enums.Claim_claimType
    status?: EnumClaim_statusFieldUpdateOperationsInput | $Enums.Claim_status
    submittedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    teachingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    teachingStartTime?: NullableStringFieldUpdateOperationsInput | string | null
    teachingEndTime?: NullableStringFieldUpdateOperationsInput | string | null
    teachingHours?: NullableFloatFieldUpdateOperationsInput | number | null
    transportType?: NullableEnumClaim_transportTypeFieldUpdateOperationsInput | $Enums.Claim_transportType | null
    transportDestinationTo?: NullableStringFieldUpdateOperationsInput | string | null
    transportDestinationFrom?: NullableStringFieldUpdateOperationsInput | string | null
    transportRegNumber?: NullableStringFieldUpdateOperationsInput | string | null
    transportCubicCapacity?: NullableIntFieldUpdateOperationsInput | number | null
    transportAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    thesisType?: NullableEnumClaim_thesisTypeFieldUpdateOperationsInput | $Enums.Claim_thesisType | null
    thesisSupervisionRank?: NullableEnumClaim_thesisSupervisionRankFieldUpdateOperationsInput | $Enums.Claim_thesisSupervisionRank | null
    thesisExamCourseCode?: NullableStringFieldUpdateOperationsInput | string | null
    thesisExamDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Center?: CenterUpdateOneRequiredWithoutClaimNestedInput
    User_Claim_submittedByIdToUser?: UserUpdateOneRequiredWithoutClaim_Claim_submittedByIdToUserNestedInput
    SupervisedStudent?: SupervisedStudentUpdateManyWithoutClaimNestedInput
  }

  export type ClaimUncheckedUpdateWithoutUser_Claim_processedByIdToUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    claimType?: EnumClaim_claimTypeFieldUpdateOperationsInput | $Enums.Claim_claimType
    status?: EnumClaim_statusFieldUpdateOperationsInput | $Enums.Claim_status
    submittedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    submittedById?: StringFieldUpdateOperationsInput | string
    centerId?: StringFieldUpdateOperationsInput | string
    teachingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    teachingStartTime?: NullableStringFieldUpdateOperationsInput | string | null
    teachingEndTime?: NullableStringFieldUpdateOperationsInput | string | null
    teachingHours?: NullableFloatFieldUpdateOperationsInput | number | null
    transportType?: NullableEnumClaim_transportTypeFieldUpdateOperationsInput | $Enums.Claim_transportType | null
    transportDestinationTo?: NullableStringFieldUpdateOperationsInput | string | null
    transportDestinationFrom?: NullableStringFieldUpdateOperationsInput | string | null
    transportRegNumber?: NullableStringFieldUpdateOperationsInput | string | null
    transportCubicCapacity?: NullableIntFieldUpdateOperationsInput | number | null
    transportAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    thesisType?: NullableEnumClaim_thesisTypeFieldUpdateOperationsInput | $Enums.Claim_thesisType | null
    thesisSupervisionRank?: NullableEnumClaim_thesisSupervisionRankFieldUpdateOperationsInput | $Enums.Claim_thesisSupervisionRank | null
    thesisExamCourseCode?: NullableStringFieldUpdateOperationsInput | string | null
    thesisExamDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    SupervisedStudent?: SupervisedStudentUncheckedUpdateManyWithoutClaimNestedInput
  }

  export type ClaimUncheckedUpdateManyWithoutUser_Claim_processedByIdToUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    claimType?: EnumClaim_claimTypeFieldUpdateOperationsInput | $Enums.Claim_claimType
    status?: EnumClaim_statusFieldUpdateOperationsInput | $Enums.Claim_status
    submittedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    submittedById?: StringFieldUpdateOperationsInput | string
    centerId?: StringFieldUpdateOperationsInput | string
    teachingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    teachingStartTime?: NullableStringFieldUpdateOperationsInput | string | null
    teachingEndTime?: NullableStringFieldUpdateOperationsInput | string | null
    teachingHours?: NullableFloatFieldUpdateOperationsInput | number | null
    transportType?: NullableEnumClaim_transportTypeFieldUpdateOperationsInput | $Enums.Claim_transportType | null
    transportDestinationTo?: NullableStringFieldUpdateOperationsInput | string | null
    transportDestinationFrom?: NullableStringFieldUpdateOperationsInput | string | null
    transportRegNumber?: NullableStringFieldUpdateOperationsInput | string | null
    transportCubicCapacity?: NullableIntFieldUpdateOperationsInput | number | null
    transportAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    thesisType?: NullableEnumClaim_thesisTypeFieldUpdateOperationsInput | $Enums.Claim_thesisType | null
    thesisSupervisionRank?: NullableEnumClaim_thesisSupervisionRankFieldUpdateOperationsInput | $Enums.Claim_thesisSupervisionRank | null
    thesisExamCourseCode?: NullableStringFieldUpdateOperationsInput | string | null
    thesisExamDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ClaimUpdateWithoutUser_Claim_submittedByIdToUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    claimType?: EnumClaim_claimTypeFieldUpdateOperationsInput | $Enums.Claim_claimType
    status?: EnumClaim_statusFieldUpdateOperationsInput | $Enums.Claim_status
    submittedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    teachingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    teachingStartTime?: NullableStringFieldUpdateOperationsInput | string | null
    teachingEndTime?: NullableStringFieldUpdateOperationsInput | string | null
    teachingHours?: NullableFloatFieldUpdateOperationsInput | number | null
    transportType?: NullableEnumClaim_transportTypeFieldUpdateOperationsInput | $Enums.Claim_transportType | null
    transportDestinationTo?: NullableStringFieldUpdateOperationsInput | string | null
    transportDestinationFrom?: NullableStringFieldUpdateOperationsInput | string | null
    transportRegNumber?: NullableStringFieldUpdateOperationsInput | string | null
    transportCubicCapacity?: NullableIntFieldUpdateOperationsInput | number | null
    transportAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    thesisType?: NullableEnumClaim_thesisTypeFieldUpdateOperationsInput | $Enums.Claim_thesisType | null
    thesisSupervisionRank?: NullableEnumClaim_thesisSupervisionRankFieldUpdateOperationsInput | $Enums.Claim_thesisSupervisionRank | null
    thesisExamCourseCode?: NullableStringFieldUpdateOperationsInput | string | null
    thesisExamDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Center?: CenterUpdateOneRequiredWithoutClaimNestedInput
    User_Claim_processedByIdToUser?: UserUpdateOneWithoutClaim_Claim_processedByIdToUserNestedInput
    SupervisedStudent?: SupervisedStudentUpdateManyWithoutClaimNestedInput
  }

  export type ClaimUncheckedUpdateWithoutUser_Claim_submittedByIdToUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    claimType?: EnumClaim_claimTypeFieldUpdateOperationsInput | $Enums.Claim_claimType
    status?: EnumClaim_statusFieldUpdateOperationsInput | $Enums.Claim_status
    submittedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    centerId?: StringFieldUpdateOperationsInput | string
    processedById?: NullableStringFieldUpdateOperationsInput | string | null
    teachingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    teachingStartTime?: NullableStringFieldUpdateOperationsInput | string | null
    teachingEndTime?: NullableStringFieldUpdateOperationsInput | string | null
    teachingHours?: NullableFloatFieldUpdateOperationsInput | number | null
    transportType?: NullableEnumClaim_transportTypeFieldUpdateOperationsInput | $Enums.Claim_transportType | null
    transportDestinationTo?: NullableStringFieldUpdateOperationsInput | string | null
    transportDestinationFrom?: NullableStringFieldUpdateOperationsInput | string | null
    transportRegNumber?: NullableStringFieldUpdateOperationsInput | string | null
    transportCubicCapacity?: NullableIntFieldUpdateOperationsInput | number | null
    transportAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    thesisType?: NullableEnumClaim_thesisTypeFieldUpdateOperationsInput | $Enums.Claim_thesisType | null
    thesisSupervisionRank?: NullableEnumClaim_thesisSupervisionRankFieldUpdateOperationsInput | $Enums.Claim_thesisSupervisionRank | null
    thesisExamCourseCode?: NullableStringFieldUpdateOperationsInput | string | null
    thesisExamDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    SupervisedStudent?: SupervisedStudentUncheckedUpdateManyWithoutClaimNestedInput
  }

  export type ClaimUncheckedUpdateManyWithoutUser_Claim_submittedByIdToUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    claimType?: EnumClaim_claimTypeFieldUpdateOperationsInput | $Enums.Claim_claimType
    status?: EnumClaim_statusFieldUpdateOperationsInput | $Enums.Claim_status
    submittedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    centerId?: StringFieldUpdateOperationsInput | string
    processedById?: NullableStringFieldUpdateOperationsInput | string | null
    teachingDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    teachingStartTime?: NullableStringFieldUpdateOperationsInput | string | null
    teachingEndTime?: NullableStringFieldUpdateOperationsInput | string | null
    teachingHours?: NullableFloatFieldUpdateOperationsInput | number | null
    transportType?: NullableEnumClaim_transportTypeFieldUpdateOperationsInput | $Enums.Claim_transportType | null
    transportDestinationTo?: NullableStringFieldUpdateOperationsInput | string | null
    transportDestinationFrom?: NullableStringFieldUpdateOperationsInput | string | null
    transportRegNumber?: NullableStringFieldUpdateOperationsInput | string | null
    transportCubicCapacity?: NullableIntFieldUpdateOperationsInput | number | null
    transportAmount?: NullableFloatFieldUpdateOperationsInput | number | null
    thesisType?: NullableEnumClaim_thesisTypeFieldUpdateOperationsInput | $Enums.Claim_thesisType | null
    thesisSupervisionRank?: NullableEnumClaim_thesisSupervisionRankFieldUpdateOperationsInput | $Enums.Claim_thesisSupervisionRank | null
    thesisExamCourseCode?: NullableStringFieldUpdateOperationsInput | string | null
    thesisExamDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type SupervisedStudentUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    studentName?: StringFieldUpdateOperationsInput | string
    thesisTitle?: StringFieldUpdateOperationsInput | string
    Claim?: ClaimUpdateOneRequiredWithoutSupervisedStudentNestedInput
  }

  export type SupervisedStudentUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    studentName?: StringFieldUpdateOperationsInput | string
    thesisTitle?: StringFieldUpdateOperationsInput | string
    claimId?: StringFieldUpdateOperationsInput | string
  }

  export type SupervisedStudentUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    studentName?: StringFieldUpdateOperationsInput | string
    thesisTitle?: StringFieldUpdateOperationsInput | string
    claimId?: StringFieldUpdateOperationsInput | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}
export default function ErrorList({
  id,
  errors,
}: {
  id?: string
  errors?: Array<string> | null
}) {
  return errors?.length ? (
    <ul id={id} className="flex flex-col gap-1">
      {errors.map((error, i) => (
        <li key={i} className="text-red-500 text-14" data-text={error}>
          {error}
        </li>
      ))}
    </ul>
  ) : null
}

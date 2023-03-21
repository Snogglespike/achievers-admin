interface Props {
  children?: React.ReactNode;
}

export default function SubTitle({ children }: Props) {
  return (
    <h3 className="mb-4 border-b border-primary font-bold uppercase">
      {children}
    </h3>
  );
}
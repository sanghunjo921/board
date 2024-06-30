export const caculateTimeDifference = (targetDate: Date) => {
  const today = new Date();

  const diffTime =
    (today.getTime() - targetDate.getTime()) / (1000 * 3600 * 24); //day로 나옴
  console.log({ diffTime });
  console.log({
    testTime:
      (today.getTime() - new Date('2024-06-10').getTime()) / (1000 * 3600 * 24),
  });
  return Math.floor(diffTime);
};

export class PerformanceCounter {
  private values: number[] = [];

  add(value: number) {
    this.values.push(value);
  }

  get count() {
    return this.values.length;
  }

  get average() {
    if (this.values.length === 0) return 0;

    return (
      this.values.reduce((a, b) => a + b, 0) /
      this.values.length
    );
  }

  get max() {
    if (this.values.length === 0) return 0;

    return Math.max(...this.values);
  }

  get min() {
    if (this.values.length === 0) return 0;

    return Math.min(...this.values);
  }

  print(title: string) {
    console.log("\n=================================");
    console.log(title);
    console.log("=================================");

    console.log(`执行次数 : ${this.count}`);
    console.log(`平均耗时 : ${this.average.toFixed(3)} ms`);
    console.log(`最大耗时 : ${this.max.toFixed(3)} ms`);
    console.log(`最小耗时 : ${this.min.toFixed(3)} ms`);
  }
}
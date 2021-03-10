// @ts-nocheck

@UCLASS()
class MyActor extends Actor {
  @UPROPERTY(Replicated, EditAnywhere)
  hello: string;

  constructor() {
    this.hello = `Hello? Random: ${Math.round(Math.random() * 100)}`;
  }

  receiveBeginPlay() {
    super.receiveBeginPlay();
    console.log(this.hello);
  }
}

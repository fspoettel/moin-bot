import IConsumerQueue from './IConsumerQueue';

interface IProducerQueue<D> {
  consumer: IConsumerQueue<D>;
}

export default IProducerQueue;
